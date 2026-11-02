import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import type { PrivateLesson } from '@/services/privateLessons';
import {
  canChangeLesson,
  formatLessonMoment,
  isLessonNow,
} from '@/utils/privateLessons';

interface LessonActionsProps {
  lesson: PrivateLesson;
  changeNoticeHours: number;
  contactEmail: string;
  // Chamado depois que o aluno volta de uma página do Calendly, ou quando o
  // prazo venceu com a tela aberta
  onChanged: () => void;
}

// O que o aluno pode fazer com uma aula agendada: entrar na sala e, dentro
// do prazo, remarcar ou cancelar. Fora do prazo, falar com a professora.
export function LessonActions({
  lesson,
  changeNoticeHours,
  contactEmail,
  onChanged,
}: LessonActionsProps) {
  const { t } = useTranslation();

  if (lesson.status !== 'scheduled') {
    return null;
  }

  const hasLinks = !!lesson.rescheduleUrl && !!lesson.cancelUrl;
  const inTime = canChangeLesson(lesson, changeNoticeHours);
  const canChange = inTime && hasLinks;
  const isNow = isLessonNow(lesson);
  const moment = formatLessonMoment(lesson);

  const joinLesson = async () => {
    if (!lesson.joinUrl) {
      return;
    }
    try {
      await Linking.openURL(lesson.joinUrl);
    } catch {
      Alert.alert(t('practice.privateLessons.openLinkError'));
    }
  };

  // Abre uma página do Calendly, se o prazo ainda não venceu
  const openChangePage = async (url: string | null) => {
    if (!url || !canChangeLesson(lesson, changeNoticeHours)) {
      onChanged();
      return;
    }
    await WebBrowser.openBrowserAsync(url);
    onChanged();
  };

  const confirmCancel = () => {
    Alert.alert(
      t('practice.privateLessons.cancelConfirm'),
      t('practice.privateLessons.cancelText'),
      [
        { text: t('practice.privateLessons.keepLesson'), style: 'cancel' },
        {
          text: t('practice.privateLessons.cancelLesson'),
          style: 'destructive',
          onPress: () => openChangePage(lesson.cancelUrl),
        },
      ]
    );
  };

  const sendEmail = async () => {
    const subject = encodeURIComponent(
      t('practice.privateLessons.emailSubject', { moment })
    );
    try {
      await Linking.openURL(`mailto:${contactEmail}?subject=${subject}`);
    } catch {
      Alert.alert(t('practice.privateLessons.talkToTeacher'), contactEmail);
    }
  };

  return (
    <View className="gap-3">
      {lesson.joinUrl ? (
        <Button
          label={t('practice.privateLessons.join')}
          onPress={joinLesson}
        />
      ) : (
        <Text className="font-poppins text-sm text-gray-600">
          {t('practice.privateLessons.linkByEmail')}
        </Text>
      )}

      {canChange ? (
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              variant="outline"
              label={t('practice.privateLessons.reschedule')}
              accessibilityLabel={t('practice.privateLessons.rescheduleLabel', {
                moment,
              })}
              onPress={() => openChangePage(lesson.rescheduleUrl)}
            />
          </View>
          <View className="flex-1">
            <Button
              variant="outline"
              label={t('common.cancel')}
              accessibilityLabel={t('practice.privateLessons.cancelLabel', {
                moment,
              })}
              onPress={confirmCancel}
            />
          </View>
        </View>
      ) : null}

      {!canChange && !isNow ? (
        <View className="gap-2 rounded-lg bg-gray-100 p-3">
          <Text className="font-poppins text-sm text-gray-700">
            {inTime
              ? ''
              : `${t('practice.privateLessons.lessThanHours', {
                  hours: changeNoticeHours,
                })} `}
            {t('practice.privateLessons.contactTeacher')}
          </Text>
          <Button
            variant="outline"
            label={t('practice.privateLessons.sendEmail')}
            onPress={sendEmail}
          />
        </View>
      ) : null}
    </View>
  );
}
