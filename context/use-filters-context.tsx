"use client";
import { type IssueType } from "@/utils/types";
import { type Sprint } from "@prisma/client";
import { type ReactNode, createContext, useContext, useState } from "react";

// Dummy type for UserResource["id"], since Clerk is removed
type UserId = string;

type FiltersContextProps = {
  assignees: UserId[];
  setAssignees: React.Dispatch<React.SetStateAction<UserId[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  epics: IssueType["id"][];
  setEpics: React.Dispatch<React.SetStateAction<IssueType["id"][]>>;
  issueTypes: IssueType["type"][];
  setIssueTypes: React.Dispatch<React.SetStateAction<IssueType["type"][]>>;
  sprints: Sprint["id"][];
  setSprints: React.Dispatch<React.SetStateAction<Sprint["id"][]>>;
};

const FiltersContext = createContext<FiltersContextProps>({
  assignees: [],
  setAssignees: () => {},
  search: "",
  setSearch: () => {},
  epics: [],
  setEpics: () => {},
  issueTypes: [],
  setIssueTypes: () => {},
  sprints: [],
  setSprints: () => {},
});

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const [assignees, setAssignees] = useState<UserId[]>([]);
  const [search, setSearch] = useState<string>("");
  const [epics, setEpics] = useState<IssueType["id"][]>([]);
  const [issueTypes, setIssueTypes] = useState<IssueType["type"][]>([]);
  const [sprints, setSprints] = useState<Sprint["id"][]>([]);

  return (
    <FiltersContext.Provider
      value={{
        assignees,
        setAssignees,
        search,
        setSearch,
        epics,
        setEpics,
        issueTypes,
        setIssueTypes,
        sprints,
        setSprints,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
};

export const useFiltersContext = () => useContext(FiltersContext);
