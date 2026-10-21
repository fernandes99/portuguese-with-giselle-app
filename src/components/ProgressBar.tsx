import { View } from 'react-native';

export function ProgressBar({
  percentage,
  onGray = false,
}: {
  percentage: number;
  // Sobre um cartão cinza: o trilho fica branco
  onGray?: boolean;
}) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      className={`h-2 w-full overflow-hidden rounded-full ${onGray ? 'bg-white' : 'bg-gray-200'}`}
    >
      <View
        className="h-full rounded-full bg-green-600"
        style={{ width: `${percentage}%` }}
      />
    </View>
  );
}
