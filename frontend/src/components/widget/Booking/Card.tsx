import { Button } from "@/components/ui/button"
import { TrainFront, MapPin } from "lucide-react"
import { TrainTicket } from "@/data/dataBooking"
import { useRouter } from "next/navigation"

interface CardProps {
  tickets: TrainTicket[]
  searchRoute?: string
}

export default function FlightTicketCard({ tickets, searchRoute }: CardProps) {
  const router = useRouter()

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
      passengers: "1", // default to 1 passenger
    })

    router.push(`/detail-booking?${bookingParams.toString()}`)
  }

  // Handle route view
  const handleViewRoute = (ticket: TrainTicket) => {
    // Extract origin and destination from ticket route
    const [origin, destination] = ticket.route.split(" > ")

    // Navigate to route page with pre-filled stations
    const routeParams = new URLSearchParams({
      from: origin.trim(),
      to: destination.trim(),
      trainName: ticket.trainName,
      trainNumber: ticket.trainNumber,
      autoSearch: "true",
    })

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
          <div
            className={`relative rounded-lg overflow-hidden ${
              ticket.available ? "bg-[#003D79]" : "bg-gray-200"
            }`}
          >
            {/* Left center notch */}
            <div className="absolute left-0 top-1/2 w-6 h-6 bg-white rounded-full transform -translate-y-1/2 -translate-x-3"></div>

            {/* Right center notch */}
            <div className="absolute right-0 top-1/2 w-6 h-6 bg-white rounded-full transform -translate-y-1/2 translate-x-3"></div>

            <div className="p-6 pl-18 pr-18">
              <div className="flex items-start justify-between">
                {/* Left Section - Train Info */}
                <div className="flex items-center gap-4">
                  <div>
                    <h3
                      className={`font-semibold text-2xl ${
                        ticket.available
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {ticket.trainName} ({ticket.trainNumber})
                    </h3>
                    <h3
                      className={`font-semibold text-md ${
                        ticket.available
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {ticket.class}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        ticket.available
                          ? "text-white/70"
                          : "text-gray-400"
                      }`}
                    >
                      {ticket.route}
                    </p>
                  </div>
                </div>

                {/* Center Section - Train Details */}
                <div className="flex-1 mx-32">
                  <div className="flex items-center justify-between mb-4">
                    {/* Departure */}
                    <div className="text-center">
                      <div
                        className={`text-sm mb-1 ${
                          ticket.available
                            ? "text-white/60"
                            : "text-gray-400"
                        }`}
                      >
                        {ticket.departureDay}
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          ticket.available
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {ticket.departureTime}{" "}
                        <span
                          className={`text-lg ${
                            ticket.available
                              ? "text-white/60"
                              : "text-gray-400"
                          }`}
                        >
                          WIB
                        </span>
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          ticket.available
                            ? "text-white/60"
                            : "text-gray-400"
                        }`}
                      >
                        {ticket.departureDate}
                      </div>
                    </div>

                    {/* Train Path */}
                    <div className="flex-1 mx-5">
                      <div className="text-center mb-5">
                        <div
                          className={`text-xs ${
                            ticket.available
                              ? "text-white/60"
                              : "text-gray-400"
                          }`}
                        >
                          Duration{" "}
                          <span className="font-medium">
                            {ticket.duration}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            ticket.available
                              ? "bg-[#F15A22]"
                              : "bg-gray-400"
                          }`}
                        ></div>
                        <div
                          className={`flex-1 h-px relative ${
                            ticket.available
                              ? "bg-white/60"
                              : "bg-gray-400"
                          }`}
                        >
                          <TrainFront
                            className={`w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                              ticket.available
                                ? "text-white bg-[#003D79]"
                                : "text-gray-400 bg-gray-200"
                            }`}
                          />
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            ticket.available
                              ? "bg-[#F15A22]"
                              : "bg-gray-400"
                          }`}
                        ></div>
                      </div>
                      <div className="text-center mt-2">
                        <div
                          className={`text-xs ${
                            ticket.available
                              ? "text-white/60"
                              : "text-gray-400"
                          }`}
                        >
                          Perjalanan
                        </div>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="text-center">
                      <div
                        className={`text-sm mb-1 ${
                          ticket.available
                            ? "text-white/60"
                            : "text-gray-400"
                        }`}
                      >
                        {ticket.arrivalDay}
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          ticket.available
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {ticket.arrivalTime}{" "}
                        <span
                          className={`text-lg ${
                            ticket.available
                              ? "text-white/60"
                              : "text-gray-400"
                          }`}
                        >
                          WIB
                        </span>
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          ticket.available
                            ? "text-white/60"
                            : "text-gray-400"
                        }`}
                      >
                        {ticket.arrivalDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Price and Buttons */}
                <div className="flex items-center gap-6">
                  {/* Price Section */}
                  <div className="text-right">
                    <div
                      className={`text-sm mb-1 ${
                        ticket.available
                          ? "text-white/60"
                          : "text-gray-400"
                      }`}
                    >
                      {ticket.available
                        ? "Tersedia"
                        : "Tidak Tersedia"}
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        ticket.available
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Rp.{" "}
                      {ticket.price.toLocaleString("id-ID")},-
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 space-y-2">
                      <Button
                        onClick={() => handleBookTicket(ticket)}
                        className={`w-full px-6 py-2 rounded-lg ${
                          ticket.available
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-gray-400 text-gray-600 cursor-not-allowed"
                        }`}
                        disabled={!ticket.available}
                      >
                        {ticket.available
                          ? "Pesan Tiket"
                          : "Habis"}
                      </Button>

                      <Button
                        onClick={() => handleViewRoute(ticket)}
                        variant="outline"
                        className={`w-full px-6 py-2 rounded-lg border-2 ${
                          ticket.available
                            ? "border-white text-dark bg-white"
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
