'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from './Button';

interface Session {
  id: string;
  day: number;
  theme: string;
  date: string;
  startTime: string;
  endTime: string;
  activities?: Array<{
    id: string;
    time: string;
    title: string;
    type: string;
  }>;
}

interface CalendarProps {
  sessions: Session[];
  bootcampId: string;
  onDateClick?: (date: Date) => void;
  className?: string;
}

export function Calendar({ sessions, bootcampId, onDateClick, className = '' }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, Session[]> = {};
    sessions.forEach((session) => {
      const dateKey = new Date(session.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });
    return grouped;
  }, [sessions]);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if date has sessions
  const getSessionsForDate = (day: number): Session[] => {
    const date = new Date(year, month, day);
    return sessionsByDate[date.toDateString()] || [];
  };

  // Check if date is today
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Check if date is in the past
  const isPast = (day: number): boolean => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            →
          </Button>
        </div>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateSessions = getSessionsForDate(day);
          const hasSessions = dateSessions.length > 0;
          const today = isToday(day);
          const past = isPast(day);

          return (
            <div
              key={day}
              className={`
                aspect-square border border-gray-200 rounded-lg p-1
                ${today ? 'bg-blue-50 border-blue-300' : ''}
                ${past && !hasSessions ? 'bg-gray-50' : ''}
                ${hasSessions ? 'bg-primary-50 border-primary-300 cursor-pointer hover:bg-primary-100' : ''}
                transition-colors
              `}
              onClick={() => {
                if (onDateClick) {
                  onDateClick(new Date(year, month, day));
                }
              }}
            >
              <div className="flex flex-col h-full">
                <div className={`
                  text-sm font-medium mb-1
                  ${today ? 'text-blue-700' : past ? 'text-gray-400' : 'text-gray-700'}
                `}>
                  {day}
                </div>
                {hasSessions && (
                  <div className="flex-1 overflow-hidden">
                    <div className="space-y-0.5">
                      {dateSessions.slice(0, 2).map((session) => (
                        <Link
                          key={session.id}
                          href={`/bootcamps/${bootcampId}/sessions/${session.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block"
                        >
                          <div className="text-xs bg-primary-600 text-white rounded px-1 py-0.5 truncate">
                            Day {session.day}
                          </div>
                        </Link>
                      ))}
                      {dateSessions.length > 2 && (
                        <div className="text-xs text-primary-600 font-medium px-1">
                          +{dateSessions.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary-50 border border-primary-300 rounded"></div>
          <span className="text-gray-600">Has Sessions</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
          <span className="text-gray-600">Past</span>
        </div>
      </div>
    </div>
  );
}

