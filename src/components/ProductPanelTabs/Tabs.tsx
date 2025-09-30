import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface TabItem {
  id?: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface TabsComponentProps {
  tabs: TabItem[];
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const TabsComponent: React.FC<TabsComponentProps> = ({
  tabs,
  value,
  onChange
}) => {
  const handleChange = (val: string) =>
    onChange({} as React.SyntheticEvent, Number(val));

  return (
    <Tabs
      value={value.toString()}
      onValueChange={handleChange}
      className="w-full h-full flex flex-col"
    >
      <TabsList className="absolute -top-[50.1px] left-1/2 transform -translate-x-1/2 flex-shrink-0">
        {tabs.map((tab, index) => (
          <TabsTrigger
            key={tab.id ?? index}
            value={index.toString()}
            aria-controls={`simple-tabpanel-${index}`}
            id={`simple-tab-${index}`}
            className="focus:outline-none focus:ring-0 border-none shadow-none data-[state=active]:border-none data-[state=active]:shadow-none"
          >
            {tab.icon}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab, index) => (
        <TabsContent
          key={tab.id ?? index}
          value={index.toString()}
          className="flex-1 m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col h-full overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4">{tab.content}</div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
