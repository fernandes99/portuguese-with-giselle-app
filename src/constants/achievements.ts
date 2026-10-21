import type { ImageSourcePropType } from 'react-native';

import discussion10 from '@assets/achievements/discussion-10.png';
import discussion10Locked from '@assets/achievements/discussion-10-locked.png';
import firstActivity from '@assets/achievements/first-activity.png';
import firstActivityLocked from '@assets/achievements/first-activity-locked.png';
import firstCourse from '@assets/achievements/first-course.png';
import firstCourseLocked from '@assets/achievements/first-course-locked.png';
import firstDiscussion from '@assets/achievements/first-discussion.png';
import firstDiscussionLocked from '@assets/achievements/first-discussion-locked.png';
import firstLesson from '@assets/achievements/first-lesson.png';
import firstLessonLocked from '@assets/achievements/first-lesson-locked.png';
import streak3 from '@assets/achievements/streak-3.png';
import streak3Locked from '@assets/achievements/streak-3-locked.png';
import streak7 from '@assets/achievements/streak-7.png';
import streak7Locked from '@assets/achievements/streak-7-locked.png';
import streak30 from '@assets/achievements/streak-30.png';
import streak30Locked from '@assets/achievements/streak-30-locked.png';

interface AchievementImages {
  image: ImageSourcePropType;
  // A mesma medalha em cinza, para quando ainda não foi desbloqueada
  locked: ImageSourcePropType;
}

// Medalha de cada conquista, pelo código do site. Conquista nova sem medalha
// aqui aparece com a medalha genérica (`AchievementBadge`).
export const ACHIEVEMENT_IMAGES: Record<string, AchievementImages> = {
  FIRST_LESSON: { image: firstLesson, locked: firstLessonLocked },
  STREAK_3: { image: streak3, locked: streak3Locked },
  STREAK_7: { image: streak7, locked: streak7Locked },
  STREAK_30: { image: streak30, locked: streak30Locked },
  FIRST_ACTIVITY: { image: firstActivity, locked: firstActivityLocked },
  FIRST_COURSE: { image: firstCourse, locked: firstCourseLocked },
  FIRST_DISCUSSION: { image: firstDiscussion, locked: firstDiscussionLocked },
  DISCUSSION_10: { image: discussion10, locked: discussion10Locked },
};
