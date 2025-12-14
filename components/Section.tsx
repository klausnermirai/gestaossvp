
import React, { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="mb-8 mt-4">
    <h2 className="text-lg font-bold text-blue-900 border-b-2 border-blue-200 pb-2 mb-4">
      {title}
    </h2>
    <div>{children}</div>
  </div>
);
