"use client"
import { useEffect, useRef } from 'react'

// Minimal, client-only Phaser boot inside Next.js App Router
export default function RailCleanerPage() {
  const gameRef = useRef<any>(null)

  useEffect(() => {
    let game: any
    let destroyed = false

    ;(async () => {
      const Phaser = (await import('phaser')).default

      const W = 960
      const H = 540

      class Boot extends Phaser.Scene {
        constructor() {
          super('boot')
        }
        preload() {
          // Load your assets from /public/assets/
          this.load.image('station', '/assets/station.png') // gambar 1 (peron stasiun)
          this.load.image('trackClean', '/assets/track-clean.png') // Frame 1 (bersih)
          this.load.image('trackDirty', '/assets/track-dirty.png') // Frame 2 (kotor)
          this.load.image('worker_stand', '/assets/worker/worker_stand.jpg') // Standing frame
          this.load.image('worker_walk1', '/assets/worker/worker_walk1.jpg') // Walking frame 1
          this.load.image('worker_walk2', '/assets/worker/worker_walk2.jpg') // Walking frame 2

          // Generate simple textures (arrow, trash-dot) using Graphics
          const g1 = this.add.graphics()
          g1.fillStyle(0xffffff, 1)
          g1.fillTriangle(0, 0, 54, 27, 0, 54)
          g1.generateTexture('arrow', 54, 54)
          g1.destroy()

          const g3 = this.add.graphics()
          g3.fillStyle(0x3b2f14, 1).fillCircle(8, 8, 8)
          g3.lineStyle(2, 0x000000, 0.9).strokeCircle(8, 8, 8)
          g3.generateTexture('trashDot', 16, 16)
          g3.destroy()
        }
        create() {
          this.scene.start('intro')
        }
      }

      class Intro extends Phaser.Scene {
        arrow!: Phaser.GameObjects.Image
        constructor() {
          super('intro')
        }
        create() {
          this.cameras.main.setBackgroundColor('#87CEEB')
          const bg = this.add.image(W / 2, H / 2, 'station')
          fitToContain(bg, W, H)

          // Arrow that points roughly to the rail area
          this.arrow = this.add.image(W / 2, H * 0.78, 'arrow').setOrigin(0.5)
          this.arrow.setScale(1.1)
          this.tweens.add({
            targets: this.arrow,
            y: '+=16',
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          })

          this.add
            .text(W / 2, 40, 'Ketuk area rel untuk mulai', {
              fontFamily: 'monospace',
              fontSize: '20px',
              color: '#111',
              backgroundColor: '#ffffffaa',
              padding: { x: 8, y: 6 },
            })
            .setOrigin(0.5)

          // Interactive zone covering the lower 40% of the screen (area rel)
          const zone = this.add
            .zone(W / 2, H * 0.75, W, H * 0.5)
            .setInteractive({ useHandCursor: true })

          zone.once('pointerdown', () => this.scene.start('game'))
        }
      }

      type Trash = Phaser.GameObjects.Image & { cleaned?: boolean }

      class Game extends Phaser.Scene {
        player!: Phaser.Physics.Arcade.Sprite
        cursors!: Phaser.Types.Input.Keyboard.CursorKeys
        progressG!: Phaser.GameObjects.Graphics
        total = 12
        cleaned = 0
        trashGroup!: Phaser.GameObjects.Group
        stationBG!: Phaser.GameObjects.Image
        dirtyBG!: Phaser.GameObjects.Image

        constructor() {
          super('game')
        }

        create() {
          this.cameras.main.setBackgroundColor('#8ab1c7')

          // Station as background
          this.stationBG = this.add.image(W / 2, H / 2, 'station')
          fitToContain(this.stationBG, W, H)

          // Dirty track overlay for gameplay area
          this.dirtyBG = this.add.image(W / 2, H / 2, 'trackDirty')
          fitToContain(this.dirtyBG, W, H)

          // Worker sprite with physics
          this.player = this.physics.add.sprite(W * 0.15, H * 0.7, 'worker_stand')
          this.player.setCollideWorldBounds(true)
          this.player.setDepth(5)

          // Define animation
          this.anims.create({
            key: 'walk',
            frames: [
              { key: 'worker_stand' },
              { key: 'worker_walk1' },
              { key: 'worker_walk2' },
              { key: 'worker_walk1' },
            ],
            frameRate: 10,
            repeat: -1,
          })

          this.cursors = this.input.keyboard!.createCursorKeys()

          // Spawn clickable trash dots within rail bounds
          this.trashGroup = this.add.group()
          const railBounds = new Phaser.Geom.Rectangle(W * 0.16, H * 0.28, W * 0.68, H * 0.44)
          for (let i = 0; i < this.total; i++) {
            const x = Phaser.Math.Between(railBounds.left + 20, railBounds.right - 20)
            const y = Phaser.Math.Between(railBounds.top + 20, railBounds.bottom - 20)
            const t = this.add.image(x, y, 'trashDot') as Trash
            t.setInteractive({ useHandCursor: true })
            t.on('pointerdown', () => this.cleanTrash(t))
            this.trashGroup.add(t)
          }

          // Simple HUD progress bar
          this.progressG = this.add.graphics()
          this.drawProgress()

          // Hint text
          this.add
            .text(W / 2, 20, 'Klik sampah di rel • ← → untuk gerak', {
              fontFamily: 'monospace',
              fontSize: '16px',
              color: '#111',
              backgroundColor: '#ffffffaa',
              padding: { x: 8, y: 4 },
            })
            .setOrigin(0.5)
        }

        cleanTrash(t: Trash) {
          if (t.cleaned) return
          t.cleaned = true
          this.cleaned += 1
          this.tweens.add({ targets: t, scale: 0, alpha: 0, duration: 160, onComplete: () => t.destroy() })
          this.drawProgress()
          if (this.cleaned >= this.total) {
            this.time.delayedCall(300, () => this.scene.start('clean'))
          }
        }

        drawProgress() {
          const pct = this.cleaned / this.total
          this.progressG.clear()
          this.progressG.fillStyle(0x000000, 0.4).fillRoundedRect(20, H - 40, W - 40, 16, 6)
          this.progressG.fillStyle(0x21c55d, 1).fillRoundedRect(20, H - 40, (W - 40) * pct, 16, 6)
          this.progressG.lineStyle(2, 0x000000, 1).strokeRoundedRect(20, H - 40, W - 40, 16, 6)
        }

        update() {
          const speed = 220
          this.player.setVelocityX(0)

          if (this.cursors.left?.isDown) {
            this.player.setVelocityX(-speed)
            this.player.anims.play('walk', true)
            this.player.flipX = true
          } else if (this.cursors.right?.isDown) {
            this.player.setVelocityX(speed)
            this.player.anims.play('walk', true)
            this.player.flipX = false
          } else {
            this.player.anims.stop()
            this.player.setTexture('worker_stand')
          }
        }
      }

      class Clean extends Phaser.Scene {
        constructor() {
          super('clean')
        }
        create() {
          this.cameras.main.setBackgroundColor('#8ab1c7')
          const bg = this.add.image(W / 2, H / 2, 'trackClean')
          fitToContain(bg, W, H)

          this.add
            .text(W / 2, 60, 'Rel bersih! 🎉', {
              fontFamily: 'monospace',
              fontSize: '28px',
              color: '#0a0',
              backgroundColor: '#ffffffcc',
              padding: { x: 10, y: 6 },
            })
            .setOrigin(0.5)

          const btn = this.add
            .text(W / 2, H - 60, 'Main lagi', {
              fontFamily: 'monospace',
              fontSize: '20px',
              color: '#111',
              backgroundColor: '#ffffffaa',
              padding: { x: 12, y: 8 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })

          btn.on('pointerdown', () => this.scene.start('intro'))
        }
      }

      // Helper: scale an image to fit keeping aspect ratio
      function fitToContain(img: Phaser.GameObjects.Image, w: number, h: number) {
        const iw = img.width
        const ih = img.height
        const s = Math.min(w / iw, h / ih)
        img.setScale(s)
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: W,
        height: H,
        parent: 'game-root',
        pixelArt: true,
        backgroundColor: '#87CEEB',
        physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 } } },
        scene: [Boot, Intro, Game, Clean],
      }

      if (!destroyed) {
        game = new Phaser.Game(config)
        gameRef.current = game
      }
    })()

    return () => {
      destroyed = true
      try {
        gameRef.current?.destroy(true)
      } catch {}
      gameRef.current = null
    }
  }, [])

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div id="game-root" />
    </div>
  )
}