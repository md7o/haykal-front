import { useMemo } from "react";
import { Dot } from "lucide-react";

export interface PasswordStrength {
  score: number; // 0-5
  label: string;
  color: string;
  suggestions: string[];
}

export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: "Enter a password",
        color: "text-gray-400",
        suggestions: [],
      };
    }

    let score = 0;
    const suggestions: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      suggestions.push("Use at least 8 characters");
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Add uppercase letters");
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Add lowercase letters");
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Add numbers");
    }

    // Special character check
    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Add special characters (@$!%*?&)");
    }

    // Length bonus
    if (password.length >= 12) {
      score += 1;
    }

    // Determine label and color
    let label: string;
    let color: string;

    switch (score) {
      case 0:
      case 1:
        label = "Very Weak";
        color = "text-red-500";
        break;
      case 2:
        label = "Weak";
        color = "text-red-400";
        break;
      case 3:
        label = "Fair";
        color = "text-yellow-500";
        break;
      case 4:
        label = "Good";
        color = "text-blue-500";
        break;
      case 5:
        label = "Strong";
        color = "text-green-500";
        break;
      case 6:
        label = "Very Strong";
        color = "text-green-600";
        break;
      default:
        label = "Very Weak";
        color = "text-red-500";
    }

    return {
      score: Math.min(score, 5),
      label,
      color,
      suggestions: suggestions.slice(0, 3), // Show max 3 suggestions
    };
  }, [password]);
}

// Password strength indicator component
interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  showSuggestions = true,
}: PasswordStrengthIndicatorProps) {
  const strength = usePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength bars */}
      <div className="flex space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < strength.score
                ? strength.score <= 2
                  ? "bg-red-500"
                  : strength.score <= 3
                  ? "bg-yellow-500"
                  : "bg-green-500"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Strength label */}
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>

      {/* Suggestions */}
      {showSuggestions && strength.suggestions.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {strength.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-center space-x-1">
              <Dot className="w-3 h-3 text-gray-400" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
