import { View } from 'react-native';

export function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
    >
      <View
        className="h-full rounded-full bg-green-600"
        style={{ width: `${percentage}%` }}
      />
    </View>
  );
}
