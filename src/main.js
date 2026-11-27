import { t } from './core/i18n.js';
import * as S from './core/state.js';
import { ensureContentAck } from './ui/content-warning.js';
import { on } from './core/events.js';
import { showEnding } from './ending/ending.js';
import { startDesktop } from './shell/desktop.js';
import { connect } from './shell/intranet.js';

// 整个游戏只发生在一台电脑的屏幕上：先是记者自己的桌面，进了内网之后是千禧年风格的终端窗口
const app = document.getElementById('app');
document.title = t('app.title');

// 效果里的 goto → 接入对应终端；ending → 结局
on('goto', (id) => connect(id));
on('ending', (key) => showEnding(key));

ensureContentAck(() => {
  if (!S.get().startedAt) S.update((s) => { s.startedAt = Date.now(); });
  startDesktop(app);
});
