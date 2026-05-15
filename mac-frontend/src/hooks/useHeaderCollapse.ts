import { useState, useEffect } from 'react';

export function useHeaderCollapse() {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const top = window.scrollY < 20;
      setIsAtTop(top);
      if (top) {
        setIsHeaderCollapsed(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isHeaderCollapsed, setIsHeaderCollapsed, isAtTop };
}

