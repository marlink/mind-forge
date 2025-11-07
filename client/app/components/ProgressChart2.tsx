'use client';

import React from 'react';

interface ProgressChartProps {
  progress: Array<{
    skill: string;
    level: string;
    assessmentDate: string;
  }>;
}

const levelToNumber = (level: string): number => {
  const levelMap: Record<string, number> = {
    'BEGINNER': 1,
    'DEVELOPING': 2,
    'PROFICIENT': 3,
    'ADVANCED': 4,
    'EXPERT': 5,
  };
  return levelMap[level.toUpperCase()] || 0;
};

const levelToColor = (level: string): string => {
  const levelMap: Record<string, string> = {
    'BEGINNER': 'bg-red-500',
    'DEVELOPING': 'bg-yellow-500',
    'PROFICIENT': 'bg-blue-500',
    'ADVANCED': 'bg-green-500',
    'EXPERT': 'bg-purple-500',
  };
  return levelMap[level.toUpperCase()] || 'bg-gray-500';
};

export function ProgressChart({ progress }: ProgressChartProps) {
  if (progress.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No progress data to display</p>
      </div>
    );
  }

  // Group by skill and get latest level for each
  const skillMap = new Map<string, { level: string; date: string }>();
  progress.forEach((record) => {
    const existing = skillMap.get(record.skill);
    if (!existing || new Date(record.assessmentDate) > new Date(existing.date)) {
      skillMap.set(record.skill, { level: record.level, date: record.assessmentDate });
    }
  });

  const skills = Array.from(skillMap.entries());
  const maxLevel = 5;

  return (
    <div className="space-y-4">
      {skills.map(([skill, { level, date }]) => {
        const levelNum = levelToNumber(level);
        const percentage = (levelNum / maxLevel) * 100;

        return (
          <div key={skill} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{skill}</span>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${levelToColor(level)} text-white`}>
                  {level}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${levelToColor(level)}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SkillDistributionProps {
  progress: Array<{
    skill: string;
    level: string;
  }>;
}

export function SkillDistribution({ progress }: SkillDistributionProps) {
  if (progress.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No skill data to display</p>
      </div>
    );
  }

  // Count skills by level
  const levelCounts: Record<string, number> = {};
  progress.forEach((record) => {
    const level = record.level.toUpperCase();
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  });

  const levels = ['BEGINNER', 'DEVELOPING', 'PROFICIENT', 'ADVANCED', 'EXPERT'];
  const total = progress.length;

  return (
    <div className="space-y-3">
      {levels.map((level) => {
        const count = levelCounts[level] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={level} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{level}</span>
              <span className="text-sm text-gray-600">{count} skills</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${levelToColor(level)}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

