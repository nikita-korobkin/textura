'use client';

import type { RefObject } from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { FocusScope } from '@react-aria/focus';
import { Toast } from '@base-ui/react/toast';
import { SearchBox, toastManager } from '@/components/search-box';
import { cn } from '@/lib/utils';

export const searchDialogHandle = DialogPrimitive.createHandle<null>();

function DialogSearchBox({
  onValidSubmit,
}: {
  onValidSubmit: () => void;
}) {
  return (
    <Toast.Provider toastManager={toastManager} limit={1}>
      <SearchBox.Provider onValidSubmit={onValidSubmit}>
        <SearchBox.Inner />
        <SearchBox.Toasts />
      </SearchBox.Provider>
    </Toast.Provider>
  );
}

export function SearchDialog({
  open,
  onOpenChange,
  actionsRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionsRef?: RefObject<DialogPrimitive.Root.Actions | null>;
}) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      actionsRef={actionsRef}
      handle={searchDialogHandle}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 isolate z-50" />
        {/* Base UI restores focus to the detached trigger on close.
            For Cmd+K opens, that incorrectly lands focus on the search
            button and can show a focus ring even though the button wasn't
            the origin of the interaction. We disable that behavior and let
            FocusScope restore the previously focused element instead. */}
        <DialogPrimitive.Popup
          finalFocus={false}
          className={cn(
            'fixed top-1/4 left-1/2 z-50 -translate-x-1/2 translate-y-0 duration-100 will-change-transform outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          )}
        >
          <FocusScope restoreFocus>
            <DialogSearchBox onValidSubmit={() => onOpenChange(false)} />
          </FocusScope>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
