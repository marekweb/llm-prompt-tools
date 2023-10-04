import { useState } from "react";
import { Extract } from "./Extract";
import FieldEditor from "./DefinitionEditor";
import { Button } from "./components/Button";
import { Card } from "./components/Card";

const App: React.FunctionComponent = () => {
  const [activeTab, setActiveTab] = useState<string | undefined>();

  if (activeTab === "fields") {
    return <FieldEditor />;
  }

  if (activeTab === "extract") {
    return <Extract />;
  }

  return (
    <div>
      <Card>
        <h1 className="font-bold text-xl text-center py-10">LLM-Extract</h1>
        <div className="text-center">
          <Button className="w-full" onClick={() => setActiveTab("fields")}>
            Open Field Editor
          </Button>

          <Button className="w-full" onClick={() => setActiveTab("extract")}>
            Open Extractor
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default App;
