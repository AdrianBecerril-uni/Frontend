import { useState, useMemo } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight, X, Users, Check, Bell, Gamepad2, ArrowLeft, PartyPopper } from "lucide-react";
import { toast } from "sonner";

interface Friend {
  steamid: string;
  personaname: string;
  avatarmedium: string;
  personastate: number;
}

interface Game {
  appid: number;
  name: string;
}

interface ScheduledSession {
  id: string;
  game: Game;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  friends: Friend[];
  confirmed: boolean;
}

interface Props {
  game: Game;
  selectedFriends: Friend[];
  onClose: () => void;
  onConfirm: (session: ScheduledSession) => void;
  existingSessions: ScheduledSession[];
}

const HOURS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
  "21:00", "22:00", "23:00", "00:00"
];

const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function SessionBooking({ game, selectedFriends, onClose, onConfirm, existingSessions }: Props) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<"date" | "time" | "confirm">("date");
  const [notifyFriends, setNotifyFriends] = useState(true);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days: { date: number; month: number; year: number; isCurrentMonth: boolean; isToday: boolean; isPast: boolean; dateStr: string }[] = [];

    // Previous month padding
    const prevMonthLast = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLast - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        date: d, month: m, year: y, isCurrentMonth: false, isToday: false, isPast: true,
        dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      });
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const isToday = dateObj.toDateString() === today.toDateString();
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        date: d, month: currentMonth, year: currentYear, isCurrentMonth: true, isToday, isPast,
        dateStr
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        date: d, month: m, year: y, isCurrentMonth: false, isToday: false, isPast: false,
        dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  const hasSessionOnDate = (dateStr: string) => {
    return existingSessions.some(s => s.date === dateStr);
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (dateStr: string, isPast: boolean) => {
    if (isPast) return;
    setSelectedDate(dateStr);
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    const session: ScheduledSession = {
      id: `session-${Date.now()}`,
      game,
      date: selectedDate,
      time: selectedTime,
      friends: selectedFriends,
      confirmed: true,
    };
    onConfirm(session);
    toast.success(
      `Sesión programada: ${game.name} el ${formatDateDisplay(selectedDate)} a las ${selectedTime}`,
      { duration: 5000 }
    );
  };

  const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayName = DAYS_ES[(date.getDay() + 6) % 7];
    return `${dayName} ${d} de ${MONTHS_ES[m - 1]}`;
  };

  // Get popular hours (simulated - peak gaming hours highlighted)
  const isPopularHour = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    return hour >= 18 && hour <= 23;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative p-5 pb-4 border-b border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step !== "date" && (
                <button
                  onClick={() => setStep(step === "confirm" ? "time" : "date")}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar size={20} className="text-blue-400" />
                  Reservar Sesión
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {step === "date" && "Elige una fecha"}
                  {step === "time" && "Elige una hora"}
                  {step === "confirm" && "Confirma la sesión"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Game card mini */}
          <div className="relative flex items-center gap-3 mt-4 bg-slate-800/60 rounded-xl p-3">
            <img
              src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
              alt={game.name}
              className="w-16 h-10 rounded-lg object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x100?text=Game"; }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{game.name}</h3>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Users size={10} />
                <span>Tú + {selectedFriends.length} amigos</span>
              </div>
            </div>
            {/* Friend avatars */}
            <div className="flex -space-x-2">
              {selectedFriends.slice(0, 3).map((f) => (
                <img
                  key={f.steamid}
                  src={f.avatarmedium}
                  alt={f.personaname}
                  className="w-7 h-7 rounded-full border-2 border-slate-800 object-cover"
                  title={f.personaname}
                />
              ))}
              {selectedFriends.length > 3 && (
                <div className="w-7 h-7 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[9px] text-slate-300 font-bold">
                  +{selectedFriends.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Step indicators */}
          <div className="relative flex items-center justify-center gap-2 mt-4">
            {["date", "time", "confirm"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s ? "bg-blue-600 text-white scale-110" :
                  ["date", "time", "confirm"].indexOf(step) > i ? "bg-emerald-600 text-white" :
                  "bg-slate-800 text-slate-500"
                }`}>
                  {["date", "time", "confirm"].indexOf(step) > i ? <Check size={12} /> : i + 1}
                </div>
                {i < 2 && (
                  <div className={`w-12 h-0.5 rounded-full transition-colors ${
                    ["date", "time", "confirm"].indexOf(step) > i ? "bg-emerald-600" : "bg-slate-800"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* STEP 1: Calendar */}
          {step === "date" && (
            <div className="animate-in fade-in duration-300">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                  <ChevronLeft size={18} />
                </button>
                <h3 className="text-sm font-bold text-white">
                  {MONTHS_ES[currentMonth]} {currentYear}
                </h3>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_ES.map(day => (
                  <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  const isSelected = selectedDate === day.dateStr;
                  const hasSession = hasSessionOnDate(day.dateStr);
                  return (
                    <button
                      key={i}
                      onClick={() => handleDateSelect(day.dateStr, day.isPast)}
                      disabled={day.isPast}
                      className={`relative h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30 scale-105"
                          : day.isToday
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/30"
                            : day.isPast
                              ? "text-slate-700 cursor-not-allowed"
                              : day.isCurrentMonth
                                ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                                : "text-slate-600 hover:bg-slate-800/50"
                      }`}
                    >
                      {day.date}
                      {day.isToday && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                      )}
                      {hasSession && !isSelected && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-800">
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-blue-400" /> Hoy
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Sesión programada
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Time selection */}
          {step === "time" && selectedDate && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-sm text-slate-400 mb-4">
                📅 <span className="text-white font-medium">{formatDateDisplay(selectedDate)}</span> — ¿A qué hora?
              </p>

              <div className="grid grid-cols-4 gap-2">
                {HOURS.map(time => {
                  const popular = isPopularHour(time);
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`relative py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30 scale-105"
                          : "bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50 hover:border-slate-600"
                      }`}
                    >
                      <Clock size={12} className="inline mr-1 opacity-50" />
                      {time}
                      {popular && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center">
                          <span className="text-[6px] text-black font-bold">🔥</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-slate-600 mt-3 flex items-center gap-1">
                🔥 Horas punta de actividad de tu grupo (18:00–23:00)
              </p>
            </div>
          )}

          {/* STEP 3: Confirmation */}
          {step === "confirm" && selectedDate && selectedTime && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
              {/* Summary card */}
              <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/20 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <img
                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                    alt={game.name}
                    className="w-24 h-14 rounded-xl object-cover shadow-lg"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x100?text=Game"; }}
                  />
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white">{game.name}</h3>
                    <div className="flex flex-col gap-1 mt-2">
                      <span className="text-sm text-slate-300 flex items-center gap-2">
                        <Calendar size={14} className="text-blue-400" />
                        {formatDateDisplay(selectedDate)}
                      </span>
                      <span className="text-sm text-slate-300 flex items-center gap-2">
                        <Clock size={14} className="text-purple-400" />
                        {selectedTime}h
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Participantes ({selectedFriends.length + 1})</h4>
                <div className="space-y-2">
                  {/* Me */}
                  <div className="flex items-center gap-3 bg-slate-800/40 rounded-xl p-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">Yo</div>
                    <span className="text-sm text-white font-medium flex-1">Tú</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Organizador</span>
                  </div>
                  {selectedFriends.map(f => (
                    <div key={f.steamid} className="flex items-center gap-3 bg-slate-800/40 rounded-xl p-2.5">
                      <img src={f.avatarmedium} alt={f.personaname} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm text-slate-300 flex-1">{f.personaname}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        f.personastate === 1
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-slate-700/50 text-slate-500 border-slate-600/30"
                      }`}>
                        {f.personastate === 1 ? "Online" : "Offline"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notify toggle */}
              <div className="flex items-center justify-between bg-slate-800/40 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <Bell size={16} className="text-amber-400" />
                  <div>
                    <p className="text-sm text-white font-medium">Notificar amigos</p>
                    <p className="text-[10px] text-slate-500">Envía una invitación a todos los participantes</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifyFriends(!notifyFriends)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${notifyFriends ? "bg-blue-600" : "bg-slate-700"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifyFriends ? "left-6" : "left-1"}`} />
                </button>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Gamepad2 size={18} />
                Confirmar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Upcoming sessions list component
export function UpcomingSessions({ sessions, onRemove }: { sessions: ScheduledSession[]; onRemove: (id: string) => void }) {
  if (sessions.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayName = DAYS_ES[(date.getDay() + 6) % 7];
    return `${dayName} ${d} ${MONTHS_ES[m - 1].slice(0, 3)}`;
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 shadow-xl mt-8">
      <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <PartyPopper className="text-amber-400" size={20} /> Sesiones Programadas
      </h3>
      <div className="space-y-3">
        {sessions.map(session => (
          <div
            key={session.id}
            className="flex items-center gap-4 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 hover:border-blue-500/30 transition-all group"
          >
            <img
              src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${session.game.appid}/header.jpg`}
              alt={session.game.name}
              className="w-20 h-12 rounded-lg object-cover shadow-md"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x100?text=Game"; }}
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{session.game.name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar size={11} className="text-blue-400" /> {formatDate(session.date)}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={11} className="text-purple-400" /> {session.time}
                </span>
              </div>
            </div>
            <div className="flex -space-x-2 mr-2">
              {session.friends.slice(0, 3).map(f => (
                <img
                  key={f.steamid}
                  src={f.avatarmedium}
                  alt={f.personaname}
                  className="w-7 h-7 rounded-full border-2 border-slate-800 object-cover"
                  title={f.personaname}
                />
              ))}
              {session.friends.length > 3 && (
                <div className="w-7 h-7 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[9px] text-slate-300 font-bold">
                  +{session.friends.length - 3}
                </div>
              )}
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold whitespace-nowrap">
              <Check size={10} className="inline mr-0.5" /> Confirmada
            </span>
            <button
              onClick={() => onRemove(session.id)}
              className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Cancelar sesión"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
