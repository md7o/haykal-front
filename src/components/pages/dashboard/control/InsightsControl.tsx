"use client";

import { Card, CardHeader } from "@/components/ui-tools/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui-tools/ui/chart";
import { Monitor, Smartphone, TabletIcon } from "lucide-react";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

export default function InsightsControl() {
  const pageView = [
    { name: "Mon", views: 120 },
    { name: "Tue", views: 210 },
    { name: "Wed", views: 150 },
    { name: "Thu", views: 300 },
    { name: "Fri", views: 240 },
    { name: "Sat", views: 1000 },
    { name: "Sun", views: 280 },
  ];

  const Location = [
    { name: "Saudi", number: 20 },
    { name: "Spain", number: 15 },
    { name: "Egypt", number: 29 },
    { name: "Australia", number: 59 },
    { name: "USA", number: 4 },
  ];
  const Devices = [
    // add lucide-react icons
    { icon: <Smartphone />, name: "Mobile", number: 1200 },
    { icon: <Monitor />, name: "Desktop", number: 800 },
    { icon: <TabletIcon />, name: "Tablet", number: 400 },
  ];

  const socialMediaClick = [
    { name: "Facebook", number: 20 },
    { name: "Instagram", number: 15 },
    { name: "LinkedIn", number: 29 },
    { name: "Twitter", number: 59 },
    { name: "WhatsApp", number: 4 },
  ];

  const config = {
    views: { label: "Views", color: "var(--color-accent)" },
    location: { label: "Location", color: "var(--color-location)" },
    devices: { label: "Devices", color: "var(--color-devices)" },
  } as const;

  return (
    <div className="p-6 space-y-5 w-[60rem] mx-auto">
      <Card className="bg-white">
        {/* General views */}
        <CardHeader className="text-lg font-semibold">Website Views</CardHeader>
        <ChartContainer config={config} id="page-views" className="h-64">
          <AreaChart data={pageView} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradient-views" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend />
            <Area type="monotone" dataKey="views" stroke="var(--color-views)" fill="url(#gradient-views)" fillOpacity={1} />
          </AreaChart>
        </ChartContainer>
      </Card>

      <Card className="bg-white">
        <CardHeader className="text-lg font-semibold">Pages Views</CardHeader>
        <ChartContainer config={config} id="page-views" className="h-64">
          <AreaChart data={pageView} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradient-views" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend />
            <Area type="monotone" dataKey="views" stroke="var(--color-views)" fill="url(#gradient-views)" fillOpacity={1} />
          </AreaChart>
        </ChartContainer>
      </Card>

      <Card className="bg-white">
        <CardHeader className="text-lg font-semibold">Location</CardHeader>
        <div>
          {Location.map((loc) => (
            <div key={loc.name} className="flex justify-between px-4 py-2 border-b border-black/5 last:border-0">
              <span className="text-sm text-description">{loc.name}</span>
              <span className="font-medium">{loc.number}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-white">
        <CardHeader className="text-lg font-semibold">Devices</CardHeader>
        <div>
          {Devices.map((device) => (
            <div key={device.name} className="flex justify-between px-4 py-2 border-b border-black/5 last:border-0">
              <span className="flex justify-center gap-3 text-sm text-description">
                {device.icon}
                {device.name}
              </span>
              <span className="font-medium">{device.number}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-white">
        <CardHeader className="text-lg font-semibold">Clicks rate</CardHeader>
        <div>
          {socialMediaClick.map((platform) => (
            <div key={platform.name} className="flex justify-between px-4 py-2 border-b border-black/5 last:border-0">
              <span className=" text-sm text-description">{platform.name}</span>
              <span className="font-medium">{platform.number}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="bg-white">
        <CardHeader className="text-lg font-semibold">Social Media Clicks</CardHeader>
        <div>
          {socialMediaClick.map((platform) => (
            <div key={platform.name} className="flex justify-between px-4 py-2 border-b border-black/5 last:border-0">
              <span className=" text-sm text-description">{platform.name}</span>
              <span className="font-medium">{platform.number}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
