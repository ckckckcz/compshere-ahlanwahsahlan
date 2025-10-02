"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Heart, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AIChatAgent } from "./Loka"

interface FAQItem {
    id: string
    question: string
    answer: string
}

interface FAQCategory {
    id: string
    title: string
    items: FAQItem[]
}

const faqData: FAQCategory[] = [
    {
        id: "about-kai",
        title: "Tentang KAI",
        items: [
            {
                id: "what-is-kai",
                question: "Apa itu PT Kereta Api Indonesia (KAI)?",
                answer:
                    "PT Kereta Api Indonesia (Persero) adalah BUMN yang bergerak di bidang transportasi perkeretaapian. KAI menyediakan layanan angkutan penumpang dan barang dengan tujuan menghadirkan transportasi massal yang aman, nyaman, selamat, dan tepat waktu.",
            },
            {
                id: "where-based",
                question: "Di mana kantor pusat KAI berada?",
                answer:
                    "Kantor pusat PT Kereta Api Indonesia (Persero) berlokasi di Bandung, Jawa Barat, Indonesia.",
            },
            {
                id: "who-for",
                question: "Layanan KAI ditujukan untuk siapa?",
                answer:
                    "Layanan KAI tersedia untuk masyarakat luas, baik untuk kebutuhan perjalanan jarak dekat, menengah, maupun jauh, serta untuk pengangkutan barang melalui jalur kereta api di seluruh Indonesia.",
            },
            {
                id: "vision-mission",
                question: "Apa visi dan misi KAI?",
                answer:
                    "Visi KAI adalah menjadi solusi ekosistem transportasi terbaik untuk Indonesia. Misinya adalah menyediakan layanan transportasi yang selamat, efisien, handal, dan berorientasi pada pelanggan.",
            },
        ],
    },
    {
        id: "services",
        title: "Layanan",
        items: [
            {
                id: "types-of-services",
                question: "Apa saja layanan yang disediakan KAI?",
                answer:
                    "KAI menyediakan layanan utama berupa angkutan penumpang (kereta jarak jauh, menengah, komuter, dan bandara) serta layanan angkutan barang. Selain itu, KAI juga menyediakan layanan pendukung seperti catering kereta, logistik, dan pariwisata.",
            },
            {
                id: "punctuality",
                question: "Apakah kereta KAI selalu tepat waktu?",
                answer:
                    "KAI berkomitmen untuk menjaga ketepatan waktu keberangkatan dan kedatangan. Jika terjadi keterlambatan, KAI akan memberikan kompensasi sesuai dengan peraturan yang berlaku.",
            },
        ],
    },
    {
        id: "ticketing",
        title: "Tiket & Reservasi",
        items: [
            {
                id: "buy-ticket",
                question: "Bagaimana cara membeli tiket kereta KAI?",
                answer:
                    "Tiket dapat dibeli melalui aplikasi resmi KAI Access, website kai.id, mesin E-Kiosk, loket stasiun, agen resmi, serta platform mitra seperti marketplace dan aplikasi transportasi online.",
            },
            {
                id: "refund",
                question: "Apakah tiket bisa dibatalkan atau diubah?",
                answer:
                    "Ya, tiket dapat dibatalkan atau diubah sesuai ketentuan yang berlaku. Proses pembatalan dan perubahan dapat dilakukan melalui aplikasi KAI Access maupun di loket stasiun.",
            },
        ],
    },
    {
        id: "facilities",
        title: "Fasilitas",
        items: [
            {
                id: "onboard-facilities",
                question: "Fasilitas apa saja yang tersedia di kereta?",
                answer:
                    "KAI menyediakan fasilitas sesuai kelas layanan, seperti AC, kursi ergonomis, toilet, stop kontak, hiburan, serta layanan makanan dan minuman. Untuk kereta eksekutif, tersedia ruang lebih luas dan kenyamanan tambahan.",
            },
            {
                id: "disability",
                question: "Apakah ada fasilitas untuk penyandang disabilitas?",
                answer:
                    "Ya, KAI menyediakan jalur khusus, ruang tunggu, dan kursi prioritas bagi penyandang disabilitas, serta akses naik-turun kereta yang ramah difabel di beberapa stasiun besar.",
            },
        ],
    },
    {
        id: "sustainability",
        title: "Keberlanjutan",
        items: [
            {
                id: "eco-friendly",
                question: "Bagaimana komitmen KAI terhadap lingkungan?",
                answer:
                    "KAI mendukung transportasi berkelanjutan dengan mengurangi emisi karbon melalui penggunaan kereta api sebagai moda transportasi massal, serta berupaya mengembangkan energi ramah lingkungan dan digitalisasi layanan.",
            },
        ],
    },
    {
        id: "ai-agent",
        title: "AI Agent",
        items: [
            {
                id: "virtual-assistant",
                question: "Apakah ada layanan AI untuk membantu pelanggan?",
                answer:
                    "Ya, KAI menyediakan asisten virtual berbasis AI di beberapa kanal digital untuk membantu pelanggan mendapatkan informasi jadwal, ketersediaan tiket, hingga layanan pelanggan secara cepat dan interaktif.",
            },
        ],
    },
]


export default function FAQSection() {
    const [activeCategory, setActiveCategory] = useState("about-kai")
    const [expandedItems, setExpandedItems] = useState<string[]>(["what-is-beautify"])

    const toggleItem = (itemId: string) => {
        setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
    }

    const activeCategoryData = faqData.find((cat) => cat.id === activeCategory)

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-start mb-16">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-4 text-balance">
                    Segala hal yang
                    <br />
                    perlu anda <span className="italic underline text-[#F15A22] ">ketahui</span>
                </h1>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mt-10">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <h3 className="text-sm font-medium text-muted-foreground mb-6">Topics</h3>
                        <nav className="space-y-2">
                            {faqData.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={cn(
                                        "block w-full text-left text-sm py-2 px-0 transition-colors duration-200",
                                        activeCategory === category.id
                                            ? "text-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    {category.title}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {activeCategory === "ai-agent" ? (
                                <div className="min-h-[600px]">
                                    <AIChatAgent />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-8">{activeCategoryData?.title}</h2>

                                    <div className="space-y-4">
                                        {activeCategoryData?.items.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                className="border-b border-border last:border-b-0"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.2, delay: 0.1 }}
                                            >
                                                <button
                                                    onClick={() => toggleItem(item.id)}
                                                    className="w-full py-6 flex items-center justify-between text-left group"
                                                >
                                                    <span className="text-base sm:text-lg text-foreground group-hover:text-muted-foreground transition-colors duration-200">
                                                        {item.question}
                                                    </span>
                                                    <motion.div
                                                        animate={{
                                                            rotate: expandedItems.includes(item.id) ? 180 : 0,
                                                        }}
                                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                                        className="ml-4 flex-shrink-0"
                                                    >
                                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                                    </motion.div>
                                                </button>

                                                <AnimatePresence>
                                                    {expandedItems.includes(item.id) && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{
                                                                duration: 0.3,
                                                                ease: "easeInOut",
                                                                opacity: { duration: 0.2 },
                                                            }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pb-6 pr-8">
                                                                <p className="text-muted-foreground leading-relaxed mb-6">{item.answer}</p>

                                                                {item.id === "what-is-beautify" && (
                                                                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                                                                        <span className="text-sm text-muted-foreground">Is this helpful?</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <button className="p-1 hover:bg-muted rounded transition-colors duration-200">
                                                                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                                                            </button>
                                                                            <button className="p-1 hover:bg-muted rounded transition-colors duration-200">
                                                                                <ThumbsDown className="w-4 h-4 text-muted-foreground" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
