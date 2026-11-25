import { openMsgBox } from './modal.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';

// 开场内容提示：必须点确认才能进入
export function ensureContentAck(then) {
  if (S.get().contentAck) return then();
  openMsgBox({
    title: t('warn.title'), text: t('warn.body'), kind: 'warning', okLabel: t('warn.confirm'), closable: false,
    onOk: () => { S.update((s) => { s.contentAck = true; }); then(); },
  });
}
