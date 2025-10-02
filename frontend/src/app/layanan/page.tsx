"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import layanan1 from "../../../public/images/layanan/angkutan_penumpang.jpg"
import layanan2 from "../../../public/images/layanan/angkutan_barang.jpg"
import layanan3 from "../../../public/images/layanan/pengusahaan_aset.jpg"

const features = [
	{
		title: "Angkutan Penumpang",
		description:
			"Layanan transportasi penumpang yang nyaman dan aman dengan berbagai fasilitas utama, dan promo menarik",
		image: layanan1,
	},
	{
		title: "Angkutan Barang",
		description:
			"Solusi pengiriman barang yang efisien dengan layanan angkutan retail dan korporat untuk memenuhi kebutuhan logistik Anda.",
		image: layanan2,
	},
	{
		title: "Pengusahaan Aset",
		description:
			"Maksimalkan potensi aset dengan layanan area komersil, space iklan, dan bangunan dinas yang strategis dan menguntungkan.",
		image: layanan3,
	},
]

export default function HomePage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<motion.section
				className="container mx-auto px-4 py-16 md:py-24"
				initial="hidden"
				animate="visible"
			>
				<div className="max-w-4xl mx-auto text-center">
					<motion.h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
						Elevate Your Chatting, <br className="hidden md:block" />
						Simplify Your Life
					</motion.h1>

					<motion.p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
						Discover a Seamless World of Professional Services, Appointments, and
						Secure Transactions – All in One Place!
					</motion.p>
				</div>
			</motion.section>

			{/* Features Section */}
			<motion.section
				className="container mx-auto px-4 pb-16 md:pb-24"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: "-100px" }}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<motion.div key={feature.title} className="group" custom={index}>
							<div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow duration-300">
								<div className="aspect-[4/3] relative overflow-hidden">
									<Image
										src={feature.image || "/placeholder.svg"}
										alt={feature.title}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
									/>
								</div>

								<div className="p-6">
									<h3 className="text-xl font-semibold text-foreground mb-3">
										{feature.title}
									</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{feature.description}
									</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</motion.section>
		</div>
	)
}
