
import { useEffect, useRef } from "react";
import { Coffee } from "lucide-react";

// Number of beans to animate
const BEAN_COUNT = 40;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const CoffeeRain = ({ duration = 5000, onEnd }: { duration?: number; onEnd?: () => void }) => {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      onEnd?.();
    }, duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration, onEnd]);

  // Generate random styles for each bean
  const beans = Array.from({ length: BEAN_COUNT }).map((_, i) => {
    const left = randomBetween(0, 95); // percent across the width
    const size = randomBetween(18, 32); // px
    const delay = randomBetween(0, 2.7); // s
    const durationDrop = randomBetween(1.7, 2.8); // s
    const rotate = randomBetween(-30, 30);

    return (
      <span
        key={i}
        className="pointer-events-none absolute"
        style={{
          left: `${left}%`,
          animation: `coffee-drop ${durationDrop}s ${delay}s linear forwards`,
          top: "-40px",
        }}
      >
        <Coffee
          style={{
            width: size,
            height: size,
            transform: `rotate(${rotate}deg)`,
            color: "#442d15",
            opacity: 0.93,
            filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.1))",
          }}
        />
      </span>
    );
  });

  // Keyframes for custom drop animation (inject into page style)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    @keyframes coffee-drop {
      0% { transform: translateY(0); opacity: 0.9; }
      10% { opacity: 1; }
      82% { opacity: 1; }
      100% { transform: translateY(100vh); opacity: 0.35; }
    }`;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none select-none">
      {beans}
    </div>
  );
};

export default CoffeeRain;