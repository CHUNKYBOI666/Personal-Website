import React from 'react';
import { GitHubCalendar } from 'react-github-calendar';

export default function Test() {
  return (
    <GitHubCalendar 
      username="CHUNKYBOI666" 
      blockRadius={3}
      theme={{
        light: ['#eeeeee', '#767676', '#676767', '#4d4d4d', '#1a1a1a']
      }}
    />
  );
}
