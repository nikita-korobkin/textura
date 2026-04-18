import {
  useHotkeys,
  type Hotkey,
  type UseHotkeyDefinition,
} from '@tanstack/react-hotkeys';

export type HotkeyAction = {
  name: string;
  hotkey: Hotkey;
  callback: UseHotkeyDefinition['callback'];
};

export function useHotkeyActions(actions: HotkeyAction[]) {
  useHotkeys(
    actions.map<UseHotkeyDefinition>((action) => ({
      hotkey: action.hotkey,
      callback: action.callback,
      options: { meta: { name: action.name } },
    })),
  );
}
