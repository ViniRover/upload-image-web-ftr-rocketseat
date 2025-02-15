import * as Collapsible from "@radix-ui/react-collapsible";
import { UploadWidgetDropzone } from "./upload-widget-dropzone";
import { UploadWidgetHeader } from "./upload-widget-header";
import { UploadWidgetUploadList } from "./upload-widget-upload-list";
import { motion, useCycle } from 'motion/react'
import { UploadWidgetMinimizedButton } from "./upload-widget-minimized-button";

export function UploadWidget() {
  const [isWidgetOpen, toggleWidgetOpen] = useCycle(false, true)

  return(
    <Collapsible.Root onOpenChange={() => toggleWidgetOpen()}>
      <motion.div 
        className="w-full overflow-hidden bg-zinc-900 max-w-[360px] rounded-xl m-auto"
        animate={isWidgetOpen ? 'opened' : 'closed'}
        variants={{
          closed: {
            width: 'max-content',
            height: 44,
            transition: {
              type: 'inertia'
            }
          },
          opened: {
            width: '100%',
            height: 'auto',
            transition: {
              duration: 0.1
            }
          }
        }}
      >
        {!isWidgetOpen && <UploadWidgetMinimizedButton />}

        <Collapsible.Content>
          <UploadWidgetHeader />

          <div className="flex flex-col gap-4 py-3">
            <UploadWidgetDropzone />

            <div className="h-px bg-zinc-800 border-t border-black/50 box-content"></div>

            <UploadWidgetUploadList />
          </div>
        </Collapsible.Content>
      </motion.div>
    </Collapsible.Root>
  )
}