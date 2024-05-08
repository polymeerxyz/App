import { RefreshCcw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useActiveAddress } from "@/hooks/useActiveAddress";

export default function ReceivePage() {
  const [legacy, setLegacy] = useState(false);
  const { full: fullAddress, legacy: legacyAddress } = useActiveAddress();

  return (
    <div className="flex h-full w-full flex-col space-y-4 p-4">
      {!!(fullAddress ?? legacyAddress) && (
        <QRCodeSVG className="self-center" value={legacy ? legacyAddress : fullAddress} />
      )}
      <Button size="sm" variant="ghost" className="mx-8" onClick={() => setLegacy((s) => !s)}>
        <RefreshCcw className="mr-2 h-4 w-4" />
        {legacy ? "Turn into full format" : "Turn into deprecated address"}
      </Button>
      <div className="mx-8">
        <p className="min-h-6 break-words rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
          {legacy ? legacyAddress : fullAddress}
        </p>
      </div>
    </div>
  );
}
