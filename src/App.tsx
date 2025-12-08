import { AppLayout } from "@/components/layout/AppLayout";
import { FlowCanvas } from "@/components/canvas/FlowCanvas";
import { Toaster } from "sonner";

function App() {
  return (
    <AppLayout>
      <FlowCanvas />
      <Toaster />
    </AppLayout>
  );
}

export default App;
