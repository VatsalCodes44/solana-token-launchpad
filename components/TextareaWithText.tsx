import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dispatch, SetStateAction } from "react"

export function TextareaWithText({description, setDescription}: {description: string, setDescription:  Dispatch<SetStateAction<string>>}) {
  return (
    <div className="my-2">
      <Label htmlFor="message-2" className="flex justify-between text-xs">
        <div>
            <span className="text-red-500 pr-1">*</span>
            <span>Description</span>
        </div>
        <div>
            {description.length}/500
        </div>
      </Label>
      <Textarea value={description} onChange={(e) => {
        if (e.target.value.length > 500) {
          setDescription(e.target.value.substring(0,499))
        } else {
          setDescription(e.target.value)
        }
      }} className="mt-2" placeholder="Ex: First community token on Solana.." id="message-2" />
    </div>
  )
}
