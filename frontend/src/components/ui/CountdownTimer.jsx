import useCountdown from '../../hooks/useCountdown';

const CountdownTimer = ({ deadline, compact = false }) => {
  const { days, hours, minutes, seconds, expired } = useCountdown(deadline);

  if (expired) {
    return <span className="text-danger text-xs font-medium">Expired</span>;
  }

  const color = days < 3 ? 'text-danger' : days < 7 ? 'text-warning' : 'text-accent';
  const bgColor = days < 3 ? 'bg-danger/10 border-danger/20' : days < 7 ? 'bg-warning/10 border-warning/20' : 'bg-accent/10 border-accent/20';

  if (compact) {
    return (
      <span className={`text-xs font-medium font-body ${color}`}>
        {days}d {hours}h {minutes}m
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border ${bgColor}`}>
      {[
        { val: days, label: 'd' },
        { val: hours, label: 'h' },
        { val: minutes, label: 'm' },
        { val: seconds, label: 's' },
      ].map(({ val, label }, i) => (
        <span key={i} className={`text-xs font-semibold font-body ${color}`}>
          {String(val).padStart(2, '0')}{label}
          {i < 3 && <span className="opacity-50 mx-0.5">:</span>}
        </span>
      ))}
    </div>
  );
};

export default CountdownTimer;
