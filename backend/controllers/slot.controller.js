import User from '../models/User.js';
import Booking from '../models/Booking.js';

/**
 * Generate time slots from provider's working hours config
 */
const generateSlots = (workingHours) => {
  const { startTime, endTime, slotDuration, breakStart, breakEnd } = workingHours;

  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toTimeStr = (mins) => {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}`;
  };

  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const bStart = toMinutes(breakStart);
  const bEnd = toMinutes(breakEnd);

  const slots = [];
  let cursor = start;

  while (cursor + slotDuration <= end) {
    const slotEnd = cursor + slotDuration;

    // Skip slots that overlap with break
    if (cursor < bEnd && slotEnd > bStart) {
      cursor = bEnd;
      continue;
    }

    slots.push({
      start: toTimeStr(cursor),
      end: toTimeStr(slotEnd),
      label: `${toTimeStr(cursor)} – ${toTimeStr(slotEnd)}`
    });

    cursor = slotEnd;
  }

  return slots;
};

/**
 * GET /api/slots/available?providerId=X&date=YYYY-MM-DD
 * Returns all time slots for a provider on a given date with availability status
 */
export const getAvailableSlots = async (req, res) => {
  try {
    const { providerId, date } = req.query;

    if (!providerId || !date) {
      return res.status(400).json({ success: false, message: 'providerId and date are required' });
    }

    // 1. Get provider's working hours
    const provider = await User.findById(providerId).select('workingHours name');
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const workingHours = provider.workingHours || {};
    const defaultHours = {
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 120,
      breakStart: '13:00',
      breakEnd: '14:00',
    };

    const config = {
      days: workingHours.days?.length ? workingHours.days : defaultHours.days,
      startTime: workingHours.startTime || defaultHours.startTime,
      endTime: workingHours.endTime || defaultHours.endTime,
      slotDuration: workingHours.slotDuration || defaultHours.slotDuration,
      breakStart: workingHours.breakStart || defaultHours.breakStart,
      breakEnd: workingHours.breakEnd || defaultHours.breakEnd,
    };

    // 2. Check if the selected date falls on a working day
    const selectedDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[selectedDate.getDay()];

    if (!config.days.includes(dayOfWeek)) {
      return res.status(200).json({
        success: true,
        data: [],
        message: `Provider is not available on ${dayOfWeek}s`,
        workingDays: config.days,
      });
    }

    // 3. Generate all possible slots
    const allSlots = generateSlots(config);

    // 4. Find existing bookings for this provider on this date (active ones only)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      providerId,
      scheduleDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['Cancelled', 'Rejected'] },
      'timeSlot.start': { $exists: true },
    }).select('timeSlot');

    const bookedSlots = new Set(
      existingBookings.map((b) => `${b.timeSlot.start}-${b.timeSlot.end}`)
    );

    // 5. Mark slots as available/booked
    // Also check if slot is in the past (for today)
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    const slotsWithAvailability = allSlots.map((slot) => {
      const key = `${slot.start}-${slot.end}`;
      const isBooked = bookedSlots.has(key);

      let isPast = false;
      if (isToday) {
        const [h, m] = slot.start.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(h, m, 0, 0);
        isPast = slotTime <= now;
      }

      return {
        ...slot,
        available: !isBooked && !isPast,
        status: isPast ? 'past' : isBooked ? 'booked' : 'available',
      };
    });

    res.status(200).json({
      success: true,
      data: slotsWithAvailability,
      workingDays: config.days,
      providerName: provider.name,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
