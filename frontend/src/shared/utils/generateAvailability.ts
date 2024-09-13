export function generateAvailability(
  startTime: string,
  endTime: string
): string[] {
  const availability: string[] = [];
  let start = new Date(`2024-01-01T${startTime}:00`);
  const end = new Date(`2024-01-01T${endTime}:00`);

  while (start < end) {
    const nextSlot = new Date(start.getTime() + 30 * 60000); // Add 30 minutes
    availability.push(
      `${start.getHours().toString().padStart(2, '0')}:${start
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
    );
    start = nextSlot;
  }

  return availability;
}
