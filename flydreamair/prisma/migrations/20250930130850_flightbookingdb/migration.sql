-- CreateTable
CREATE TABLE "public"."Country" (
    "id" SERIAL NOT NULL,
    "countryName" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."City" (
    "id" SERIAL NOT NULL,
    "cityName" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Airport" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "code" VARCHAR(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Airport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Airline" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Airline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FlightSupply" (
    "id" SERIAL NOT NULL,
    "flightNo" TEXT NOT NULL,
    "airlineId" INTEGER NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "departingAirportId" INTEGER NOT NULL,
    "arrivingAirportId" INTEGER NOT NULL,

    CONSTRAINT "FlightSupply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingClass" (
    "id" SERIAL NOT NULL,
    "className" TEXT NOT NULL,
    "itemOrder" INTEGER,

    CONSTRAINT "BookingClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SeatSupply" (
    "flightSupplyId" INTEGER NOT NULL,
    "bookingClassId" INTEGER NOT NULL,
    "noSeats" INTEGER NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,

    CONSTRAINT "SeatSupply_pkey" PRIMARY KEY ("flightSupplyId","bookingClassId")
);

-- CreateTable
CREATE TABLE "public"."BookingType" (
    "id" SERIAL NOT NULL,
    "typeName" TEXT NOT NULL,

    CONSTRAINT "BookingType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "bookingTypeId" INTEGER NOT NULL,
    "pnr" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Passenger" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "email" TEXT,
    "phone" TEXT,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookedFlight" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "flightSupplyId" INTEGER NOT NULL,
    "bookingClassId" INTEGER NOT NULL,
    "fareAmount" DECIMAL(10,2) NOT NULL,
    "fareCurrency" CHAR(3) NOT NULL,

    CONSTRAINT "BookedFlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookedSeat" (
    "bookedFlightId" INTEGER NOT NULL,
    "passengerId" INTEGER NOT NULL,
    "seatNo" TEXT NOT NULL,

    CONSTRAINT "BookedSeat_pkey" PRIMARY KEY ("bookedFlightId","seatNo")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "txRef" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "City_countryId_idx" ON "public"."City"("countryId");

-- CreateIndex
CREATE INDEX "Airport_cityId_idx" ON "public"."Airport"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Airport_code_key" ON "public"."Airport"("code");

-- CreateIndex
CREATE INDEX "FlightSupply_departureTime_departingAirportId_arrivingAirpo_idx" ON "public"."FlightSupply"("departureTime", "departingAirportId", "arrivingAirportId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_pnr_key" ON "public"."Booking"("pnr");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "public"."Booking"("userId");

-- CreateIndex
CREATE INDEX "Passenger_bookingId_idx" ON "public"."Passenger"("bookingId");

-- CreateIndex
CREATE INDEX "BookedFlight_bookingId_idx" ON "public"."BookedFlight"("bookingId");

-- CreateIndex
CREATE INDEX "BookedFlight_flightSupplyId_idx" ON "public"."BookedFlight"("flightSupplyId");

-- CreateIndex
CREATE UNIQUE INDEX "BookedSeat_bookedFlightId_passengerId_key" ON "public"."BookedSeat"("bookedFlightId", "passengerId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "public"."Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "Session_sessionToken_idx" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE INDEX "VerificationToken_expires_idx" ON "public"."VerificationToken"("expires");

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Airport" ADD CONSTRAINT "Airport_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlightSupply" ADD CONSTRAINT "FlightSupply_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "public"."Airline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlightSupply" ADD CONSTRAINT "FlightSupply_departingAirportId_fkey" FOREIGN KEY ("departingAirportId") REFERENCES "public"."Airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlightSupply" ADD CONSTRAINT "FlightSupply_arrivingAirportId_fkey" FOREIGN KEY ("arrivingAirportId") REFERENCES "public"."Airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeatSupply" ADD CONSTRAINT "SeatSupply_flightSupplyId_fkey" FOREIGN KEY ("flightSupplyId") REFERENCES "public"."FlightSupply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeatSupply" ADD CONSTRAINT "SeatSupply_bookingClassId_fkey" FOREIGN KEY ("bookingClassId") REFERENCES "public"."BookingClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_bookingTypeId_fkey" FOREIGN KEY ("bookingTypeId") REFERENCES "public"."BookingType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Passenger" ADD CONSTRAINT "Passenger_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookedFlight" ADD CONSTRAINT "BookedFlight_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookedFlight" ADD CONSTRAINT "BookedFlight_flightSupplyId_fkey" FOREIGN KEY ("flightSupplyId") REFERENCES "public"."FlightSupply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookedFlight" ADD CONSTRAINT "BookedFlight_bookingClassId_fkey" FOREIGN KEY ("bookingClassId") REFERENCES "public"."BookingClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookedSeat" ADD CONSTRAINT "BookedSeat_bookedFlightId_fkey" FOREIGN KEY ("bookedFlightId") REFERENCES "public"."BookedFlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookedSeat" ADD CONSTRAINT "BookedSeat_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "public"."Passenger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
