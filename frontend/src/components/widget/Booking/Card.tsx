import { Button } from "@/components/ui/button"
import { TrainFront, MapPin } from "lucide-react"
import { TrainTicket } from "@/data/dataBooking"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"

interface CardProps {
  tickets: TrainTicket[]
  searchRoute?: string
}

export default function FlightTicketCard({ tickets, searchRoute }: CardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("user_id")

  // Sort tickets: available first, then unavailable
  const sortedTickets = [...tickets].sort((a, b) => {
    if (a.available && !b.available) return -1
    if (!a.available && b.available) return 1
    return 0
  })

  // Handle booking - navigate to detail-booking with ticket data
  const handleBookTicket = (ticket: TrainTicket) => {
    const [origin, destination] = ticket.route.split(" > ")

    const bookingParams = new URLSearchParams({
      ticketId: ticket.id.toString(),
      trainName: ticket.trainName,
      trainNumber: ticket.trainNumber,
      class: ticket.class,
      origin: origin.trim(),
      destination: destination.trim(),
      departureTime: ticket.departureTime,
      arrivalTime: ticket.arrivalTime,
      departureDate: ticket.departureDate,
      arrivalDate: ticket.arrivalDate,
      duration: ticket.duration,
      price: ticket.price.toString(),
      passengers: "0",
    })

    if (userId) {
      bookingParams.append("user_id", userId)
    }

    router.push(`/detail-booking?${bookingParams.toString()}`)
  }
  const handleViewRoute = (ticket: TrainTicket) => {
    const [origin, destination] = ticket.route.split(" > ")

    const routeParams = new URLSearchParams({
      from: origin.trim(),
      to: destination.trim(),
      trainName: ticket.trainName,
      trainNumber: ticket.trainNumber,
      autoSearch: "true",
    })

    if (userId) {
      routeParams.append("user_id", userId)
    }

    router.push(`/rute?${routeParams.toString()}`)
  }

  // Show no results message if no tickets found
  if (tickets.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <TrainFront className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Tidak Ada Tiket Ditemukan
          </h3>
          <p className="text-gray-500">
            {searchRoute
              ? `Maaf, tidak ada tiket kereta untuk rute ${searchRoute} pada tanggal yang dipilih.`
              : "Maaf, tidak ada tiket kereta yang tersedia untuk pencarian Anda."}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Coba ubah tanggal atau rute perjalanan Anda.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {sortedTickets.map((ticket) => (
        <div key={ticket.id} className="w-full mx-auto relative">
          <div className={`relative rounded-lg overflow-hidden ${ticket.available ? "bg-[#003D79]" : "bg-gray-200"}`}>
            {/* Left center notch - hidden on mobile, visible on md+ */}
            <div className="hidden md:block absolute left-0 top-1/2 w-6 h-6 bg-white rounded-full transform -translate-y-1/2 -translate-x-3"></div>

            {/* Right center notch - hidden on mobile, visible on md+ */}
            <div className="hidden md:block absolute right-0 top-1/2 w-6 h-6 bg-white rounded-full transform -translate-y-1/2 translate-x-3"></div>

            <div className="p-4 sm:p-6 md:pl-12 md:pr-12 lg:pl-18 lg:pr-18">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                {/* Left Section - Train Info */}
                <div className="flex items-start gap-4">
                  <div>
                    <h3
                      className={`font-semibold text-xl sm:text-2xl ${
                        ticket.available ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {ticket.trainName} ({ticket.trainNumber})
                    </h3>
                    <h3
                      className={`font-semibold text-sm sm:text-md ${
                        ticket.available ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {ticket.class}
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 ${ticket.available ? "text-white/70" : "text-gray-400"}`}>
                      {ticket.route}
                    </p>
                  </div>
                </div>

                {/* Center Section - Train Details */}
                <div className="flex-1 md:mx-8 lg:mx-16 xl:mx-32">
                  {/* Desktop/Tablet Layout - Horizontal */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
                    {/* Departure */}
                    <div className="text-center sm:text-left">
                      <div
                        className={`text-xs sm:text-sm mb-1 ${ticket.available ? "text-white/60" : "text-gray-400"}`}
                      >
                        {ticket.departureDay}
                      </div>
                      <div
                        className={`text-xl sm:text-2xl font-bold ${ticket.available ? "text-white" : "text-gray-400"}`}
                      >
                        {ticket.departureTime}{" "}
                        <span
                          className={`text-base sm:text-lg ${ticket.available ? "text-white/60" : "text-gray-400"}`}
                        >
                          WIB
                        </span>
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-medium ${
                          ticket.available ? "text-white/60" : "text-gray-400"
                        }`}
                      >
                        {ticket.departureDate}
                      </div>
                    </div>

                    {/* Train Path */}
                    <div className="flex-1 sm:mx-4 lg:mx-5">
                      <div className="text-center mb-3 sm:mb-5">
                        <div className={`text-xs ${ticket.available ? "text-white/60" : "text-gray-400"}`}>
                          Duration <span className="font-medium">{ticket.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            ticket.available ? "bg-[#F15A22]" : "bg-gray-400"
                          }`}
                        ></div>
                        <div className={`flex-1 h-px relative ${ticket.available ? "bg-white/60" : "bg-gray-400"}`}>
                          <TrainFront
                            className={`w-5 h-5 sm:w-6 sm:h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                              ticket.available ? "text-white bg-[#003D79]" : "text-gray-400 bg-gray-200"
                            }`}
                          />
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            ticket.available ? "bg-[#F15A22]" : "bg-gray-400"
                          }`}
                        ></div>
                      </div>
                      <div className="text-center mt-2">
                        <div className={`text-xs ${ticket.available ? "text-white/60" : "text-gray-400"}`}>
                          Perjalanan
                        </div>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="text-center sm:text-right">
                      <div
                        className={`text-xs sm:text-sm mb-1 ${ticket.available ? "text-white/60" : "text-gray-400"}`}
                      >
                        {ticket.arrivalDay}
                      </div>
                      <div
                        className={`text-xl sm:text-2xl font-bold ${ticket.available ? "text-white" : "text-gray-400"}`}
                      >
                        {ticket.arrivalTime}{" "}
                        <span
                          className={`text-base sm:text-lg ${ticket.available ? "text-white/60" : "text-gray-400"}`}
                        >
                          WIB
                        </span>
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-medium ${
                          ticket.available ? "text-white/60" : "text-gray-400"
                        }`}
                      >
                        {ticket.arrivalDate}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Layout - Vertical Timeline */}
                  <div className="flex sm:hidden gap-4">
                    {/* Left Column - Times and Duration */}
                    <div className="flex flex-col gap-6">
                      {/* Departure Time */}
                      <div>
                        <div className={`text-2xl font-bold ${ticket.available ? "text-white" : "text-gray-400"}`}>
                          {ticket.departureTime}
                        </div>
                        <div className={`text-xs ${ticket.available ? "text-white/60" : "text-gray-400"}`}>
                          {ticket.departureDay}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className={`text-sm ${ticket.available ? "text-white/80" : "text-gray-400"}`}>
                        {ticket.duration}
                      </div>

                      {/* Arrival Time */}
                      <div>
                        <div className={`text-2xl font-bold ${ticket.available ? "text-white" : "text-gray-400"}`}>
                          {ticket.arrivalTime}
                        </div>
                        <div className={`text-xs ${ticket.available ? "text-white/60" : "text-gray-400"}`}>
                          {ticket.arrivalDay}
                        </div>
                      </div>
                    </div>

                    {/* Center Column - Vertical Line with Train Icon */}
                    <div className="flex flex-col items-center py-1">
                      {/* Top Dot */}
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          ticket.available ? "bg-[#F15A22]" : "bg-gray-400"
                        }`}
                      ></div>

                      {/* Dashed Line */}
                      <div
                        className="flex-1 w-px border-l-2 border-dashed my-2"
                        style={{
                          borderColor: ticket.available ? "rgba(255, 255, 255, 0.4)" : "rgba(156, 163, 175, 0.6)",
                        }}
                      ></div>

                      {/* Train Icon */}
                      <div className={`p-2 rounded-lg ${ticket.available ? "bg-white/10" : "bg-gray-300"}`}>
                        <TrainFront className={`w-6 h-6 ${ticket.available ? "text-white" : "text-gray-400"}`} />
                      </div>

                      {/* Bottom Dashed Line */}
                      <div
                        className="flex-1 w-px border-l-2 border-dashed my-2"
                        style={{
                          borderColor: ticket.available ? "rgba(255, 255, 255, 0.4)" : "rgba(156, 163, 175, 0.6)",
                        }}
                      ></div>

                      {/* Bottom Circle */}
                      <div
                        className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                          ticket.available ? "border-white bg-transparent" : "border-gray-400 bg-transparent"
                        }`}
                      ></div>
                    </div>

                    {/* Right Column - Station Names and Train Info */}
                    <div className="flex-1 flex flex-col gap-4">
                      {/* Departure Station */}
                      <div>
                        <div className={`text-base font-semibold ${ticket.available ? "text-white" : "text-gray-400"}`}>
                          {ticket.route.split(" - ")[0]}
                        </div>
                      </div>

                      {/* Train Name and Class */}
                      <div className="py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <TrainFront className={`w-5 h-5 ${ticket.available ? "text-white" : "text-gray-400"}`} />
                          <div className={`text-base font-bold ${ticket.available ? "text-white" : "text-gray-400"}`}>
                            {ticket.trainName}
                          </div>
                        </div>
                        <div className={`text-sm ${ticket.available ? "text-white/70" : "text-gray-400"}`}>
                          {ticket.class}
                        </div>
                      </div>

                      {/* Arrival Station */}
                      <div>
                        <div className={`text-base font-semibold ${ticket.available ? "text-white" : "text-gray-400"}`}>
                          {ticket.route.split(" - ")[1]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Price and Buttons */}
                <div className="flex flex-col items-center md:items-end gap-4">
                  {/* Price Section */}
                  <div className="text-center md:text-right">
                    <div className={`text-xs sm:text-sm mb-1 ${ticket.available ? "text-white/60" : "text-gray-400"}`}>
                      {ticket.available ? "Tersedia" : "Tidak Tersedia"}
                    </div>
                    <div
                      className={`text-xl sm:text-2xl font-bold ${ticket.available ? "text-white" : "text-gray-400"}`}
                    >
                      Rp. {ticket.price.toLocaleString("id-ID")},-
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 space-y-2 w-full sm:w-auto">
                      <Button
                        onClick={() => handleBookTicket(ticket)}
                        className={`w-full sm:w-auto px-6 py-2 rounded-lg mr-2 ${
                          ticket.available
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-gray-400 text-gray-600 cursor-not-allowed"
                        }`}
                        disabled={!ticket.available}
                      >
                        {ticket.available ? "Pesan Tiket" : "Habis"}
                      </Button>

                      <Button
                        onClick={() => handleViewRoute(ticket)}
                        variant="outline"
                        className={`w-full sm:w-auto px-6 py-2 rounded-lg border-2 ${
                          ticket.available
                            ? "border-white text-dark bg-white hover:bg-white/90"
                            : "bg-gray-300 hover:bg-gray-300 hover:text-gray-400 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Lihat Rute
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}