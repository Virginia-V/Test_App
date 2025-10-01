"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const tabStyles = {
  base: "cursor-pointer rounded-none",
  active: `
    data-[state=active]:bg-[var(--tabs-active)]
    first:data-[state=active]:rounded-tl-lg
    last:data-[state=active]:rounded-tr-lg
    dark:data-[state=active]:text-foreground
    focus-visible:border-ring
    focus-visible:ring-ring/50
    focus-visible:outline-ring
    dark:data-[state=active]:bg-input/30
    text-foreground
    dark:text-muted-foreground
    inline-flex h-[100%]
    flex-1 items-center justify-center
    gap-1.5 rounded-none
    border-transparent
    px-4 py-1
    min-w-[70px] sm:min-w-[90px] md:min-w-[100px] lg:min-w-[120px]
    text-sm
    font-medium
    whitespace-nowrap
    transition-[color,box-shadow]
    focus-visible:ring-[3px]
    focus-visible:outline-1
    disabled:pointer-events-none
    disabled:opacity-50
    [&_svg]:pointer-events-none
    [&_svg]:shrink-0
    [&_svg:not([class*='size-'])]:size-2
  `
};

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-[var(--tabs-list)] inline-flex h-[50px] items-center justify-center rounded-t-lg overflow-x-auto scrollbar-none",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabStyles.base, tabStyles.active, className)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
