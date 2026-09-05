import React, { useRef } from "react";

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = "line",
  className = "",
}) {
  const tabListRef = useRef(null);

  function handleKeyDown(event, currentIndex) {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const enabledIndex = enabledTabs.findIndex((t) => t.id === tabs[currentIndex].id);

    let nextIndex = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (enabledIndex + 1) % enabledTabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (enabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = enabledTabs.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const nextTab = enabledTabs[nextIndex];
      onChange?.(nextTab.id);

      const buttons = tabListRef.current?.querySelectorAll('[role="tab"]:not(:disabled)');
      if (buttons && buttons[nextIndex]) {
        buttons[nextIndex].focus();
      }
    }
  }

  return (
    <div
      ref={tabListRef}
      className={("dt-tabs dt-tabs--" + variant + " " + className).trim()}
      role="tablist"
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={"tab-" + tab.id}
            aria-selected={isActive}
            aria-controls={"tabpanel-" + tab.id}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            className={("dt-tab " + (isActive ? "dt-tab--active" : "")).trim()}
            onClick={() => onChange?.(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span className="dt-badge dt-badge--sm">{tab.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
