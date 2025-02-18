"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  Filter,
  ImageIcon,
  MapPin,
  MoreVertical,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface Avatar {
  name: string;
  avatar: string;
}

interface EventType {
  id: number;
  title: string;
  date: Date;
  location: string;
  status: "upcoming" | "in-progress" | "completed";
  totalPhotos: number;
  uploadProgress: number;
  photographer: Avatar;
  team: Avatar[];
  type: string;
  clientName: string;
}

const events: EventType[] = [
  {
    id: 1,
    title: "Johnson Wedding",
    date: new Date(2024, 5, 15),
    location: "Grand Plaza Hotel, New York",
    status: "upcoming",
    totalPhotos: 0,
    uploadProgress: 0,
    photographer: {
      name: "Alice Cooper",
      avatar: "/placeholder.svg",
    },
    team: [
      { name: "Bob Wilson", avatar: "/placeholder.svg" },
      { name: "Charlie Brown", avatar: "/placeholder.svg" },
    ],
    type: "Wedding",
    clientName: "Sarah & Mike Johnson",
  },
  {
    id: 2,
    title: "Tech Conference 2024",
    date: new Date(2024, 3, 28),
    location: "Innovation Center, Silicon Valley",
    status: "in-progress",
    totalPhotos: 850,
    uploadProgress: 65,
    photographer: {
      name: "Diana Ross",
      avatar: "/placeholder.svg",
    },
    team: [
      { name: "Edward Smith", avatar: "/placeholder.svg" },
      { name: "Frank Moore", avatar: "/placeholder.svg" },
      { name: "Grace Lee", avatar: "/placeholder.svg" },
    ],
    type: "Corporate",
    clientName: "TechCorp Inc.",
  },
  {
    id: 3,
    title: "Smith Family Reunion",
    date: new Date(2024, 3, 15),
    location: "Central Park, New York",
    status: "completed",
    totalPhotos: 425,
    uploadProgress: 100,
    photographer: {
      name: "Bob Wilson",
      avatar: "/placeholder.svg",
    },
    team: [{ name: "Alice Cooper", avatar: "/placeholder.svg" }],
    type: "Family",
    clientName: "Smith Family",
  },
  {
    id: 4,
    title: "Fashion Week Spring Collection",
    date: new Date(2024, 4, 5),
    location: "Metropolitan Fashion Center",
    status: "in-progress",
    totalPhotos: 1240,
    uploadProgress: 82,
    photographer: {
      name: "Grace Lee",
      avatar: "/placeholder.svg",
    },
    team: [
      { name: "Diana Ross", avatar: "/placeholder.svg" },
      { name: "Helen White", avatar: "/placeholder.svg" },
      { name: "Ian Black", avatar: "/placeholder.svg" },
    ],
    type: "Fashion",
    clientName: "Vogue Enterprises",
  },
  {
    id: 5,
    title: "Thompson-Garcia Wedding",
    date: new Date(2024, 6, 22),
    location: "Sunset Beach Resort",
    status: "upcoming",
    totalPhotos: 0,
    uploadProgress: 0,
    photographer: {
      name: "Charlie Brown",
      avatar: "/placeholder.svg",
    },
    team: [
      { name: "Alice Cooper", avatar: "/placeholder.svg" },
      { name: "Frank Moore", avatar: "/placeholder.svg" },
    ],
    type: "Wedding",
    clientName: "Emma & Juan Thompson-Garcia",
  },
  {
    id: 6,
    title: "Annual Charity Gala",
    date: new Date(2024, 3, 10),
    location: "Riverside Convention Center",
    status: "completed",
    totalPhotos: 685,
    uploadProgress: 100,
    photographer: {
      name: "Edward Smith",
      avatar: "/placeholder.svg",
    },
    team: [
      { name: "Grace Lee", avatar: "/placeholder.svg" },
      { name: "Helen White", avatar: "/placeholder.svg" },
    ],
    type: "Corporate",
    clientName: "Hope Foundation",
  },
  {
    id: 7,
    title: "Product Launch - EcoTech",
    date: new Date(2024, 5, 8),
    location: "Green Innovation Hub",
    status: "upcoming",
    totalPhotos: 0,
    uploadProgress: 0,
    photographer: {
      name: "Frank Moore",
      avatar: "/placeholder.svg",
    },
    team: [
      { name: "Diana Ross", avatar: "/placeholder.svg" },
      { name: "Ian Black", avatar: "/placeholder.svg" },
    ],
    type: "Corporate",
    clientName: "EcoTech Solutions",
  },
  {
    id: 8,
    title: "Martinez Quinceañera",
    date: new Date(2024, 4, 20),
    location: "Golden Palace",
    status: "completed",
    totalPhotos: 562,
    uploadProgress: 100,
    photographer: {
      name: "Helen White",
      avatar: "/placeholder.svg",
    },
    team: [
      { name: "Charlie Brown", avatar: "/placeholder.svg" },
      { name: "Grace Lee", avatar: "/placeholder.svg" },
    ],
    type: "Family",
    clientName: "Martinez Family",
  },
  {
    id: 9,
    title: "Summer Music Festival",
    date: new Date(2024, 7, 1),
    location: "Meadowlands Arena",
    status: "upcoming",
    totalPhotos: 0,
    uploadProgress: 0,
    photographer: {
      name: "Ian Black",
      avatar: "/placeholder.svg",
    },
    team: [
      { name: "Bob Wilson", avatar: "/placeholder.svg" },
      { name: "Diana Ross", avatar: "/placeholder.svg" },
      { name: "Edward Smith", avatar: "/placeholder.svg" },
      { name: "Frank Moore", avatar: "/placeholder.svg" },
    ],
    type: "Entertainment",
    clientName: "Soundwave Productions",
  },
  {
    id: 10,
    title: "Anderson Baby Shower",
    date: new Date(2024, 4, 12),
    location: "Botanical Gardens",
    status: "in-progress",
    totalPhotos: 245,
    uploadProgress: 45,
    photographer: {
      name: "Grace Lee",
      avatar: "/placeholder.svg",
    },
    team: [{ name: "Helen White", avatar: "/placeholder.svg" }],
    type: "Family",
    clientName: "Anderson Family",
  },
  {
    id: 11,
    title: "Corporate Headshots - LegalCo",
    date: new Date(2024, 5, 30),
    location: "LegalCo Headquarters",
    status: "upcoming",
    totalPhotos: 0,
    uploadProgress: 0,
    photographer: {
      name: "Diana Ross",
      avatar: "/placeholder.svg",
    },
    team: [
      { name: "Alice Cooper", avatar: "/placeholder.svg" },
      { name: "Bob Wilson", avatar: "/placeholder.svg" },
    ],
    type: "Corporate",
    clientName: "LegalCo Associates",
  },
  {
    id: 12,
    title: "Winter Fashion Collection",
    date: new Date(2024, 3, 5),
    location: "Urban Studio Space",
    status: "completed",
    totalPhotos: 890,
    uploadProgress: 100,
    photographer: {
      name: "Helen White",
      avatar: "/placeholder.svg",
    },
    team: [
      { name: "Grace Lee", avatar: "/placeholder.svg" },
      { name: "Ian Black", avatar: "/placeholder.svg" },
      { name: "Frank Moore", avatar: "/placeholder.svg" },
    ],
    type: "Fashion",
    clientName: "Style Magazine",
  },
];

const statusColors: { [key: string]: string } = {
  upcoming: "bg-blue-500/10 text-blue-500",
  "in-progress": "bg-yellow-500/10 text-yellow-500",
  completed: "bg-green-500/10 text-green-500",
};

const statusText = {
  upcoming: "Upcoming",
  "in-progress": "In Progress",
  completed: "Completed",
};

export default function EventManagePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Events</h2>
            <p className="text-muted-foreground">
              Manage your photography events and sessions
            </p>
          </div>
          <Button className="w-full md:w-auto">
            <Calendar className="mr-2 h-4 w-4" />
            Create New Event
          </Button>
        </div>

        {/* Filters */}
        <motion.div
          className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events, clients, or locations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <ImageIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Wedding">Wedding</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Link href={"/events/detail/123"}>
                <Card className="overflow-hidden hover:cursor-pointer hover:bg-foreground/10">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {event.clientName}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Event</DropdownMenuItem>
                          <DropdownMenuItem>View Gallery</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Cancel Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {format(event.date, "PPP")}
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {event.location}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={statusColors[event.status]}
                        >
                          {statusText[event.status]}
                        </Badge>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>

                      {event.status !== "upcoming" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Upload Progress
                            </span>
                            <span className="font-medium">
                              {event.uploadProgress}%
                            </span>
                          </div>
                          <Progress
                            value={event.uploadProgress}
                            className="h-1"
                          />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Photos
                            </span>
                            <span className="font-medium">
                              {event.totalPhotos}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex -space-x-2">
                          <Avatar className="border-2 border-background">
                            <AvatarImage
                              src={event.photographer.avatar}
                              alt={event.photographer.name}
                            />
                            <AvatarFallback>
                              {event.photographer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {event.team.map((member, i) => (
                            <Avatar
                              key={i}
                              className="border-2 border-background"
                            >
                              <AvatarImage
                                src={member.avatar}
                                alt={member.name}
                              />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-1 h-4 w-4" />
                          {event.team.length + 1}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
