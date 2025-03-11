import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  AccordionItem,
  Accordion,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { FaChevronRight } from "react-icons/fa";
import { IssueIcon } from "../issue/issue-icon";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import clsx from "clsx";
import { IssueSelectStatus } from "../issue/issue-select-status";
import { IssueAssigneeSelect } from "../issue/issue-select-assignee";
import { AiOutlinePlus } from "react-icons/ai";
import { Button } from "../ui/button";
import { useSelectedIssueContext } from "@/context/use-selected-issue-context";
import { EmtpyIssue } from "../issue/issue-empty";
import { type IssueType } from "@/utils/types";
import { LIGHT_COLORS } from "../color-picker";
import {
  assigneeNotInFilters,
  epicNotInFilters,
  isSubtask,
  issueNotInSearch,
  issueSprintNotInFilters,
  issueTypeNotInFilters,
} from "@/utils/helpers";
import { useFiltersContext } from "@/context/use-filters-context";
import { ProgressBar } from "@/components/progress-bar";

// Dummy user to replace Clerk
const dummyUser = { id: "dummy-user", name: "Guest User" };

const EpicsTable: React.FC = () => {
  const { createIssue, isCreating } = useIssues();
  const [isCreatingEpic, setIsCreatingEpic] = useState(false);
  const renderContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!renderContainerRef.current) return;
    const calculatedHeight = renderContainerRef.current.offsetTop + 15;
    renderContainerRef.current.style.height = `calc(100vh - ${calculatedHeight}px)`;
  }, []);

  function handleCreateIssue({
    name,
    type,
    parentId = null,
    sprintColor = null,
  }: CreateIssueProps) {
    if (!name) {
      return;
    }
    createIssue(
      {
        name,
        type,
        parentId,
        sprintId: null,
        reporterId: dummyUser.id, // Replacing Clerk user
        sprintColor,
      },
      {
        onSuccess: () => {
          setIsCreatingEpic(false);
        },
      }
    );
  }

  return (
    <div
      className="w-full overflow-y-auto rounded-[3px] border"
      ref={renderContainerRef}
    >
      <div className="sticky top-0 z-10 h-10 bg-gray-100" />
      <EpicsAccordion handleCreateIssue={handleCreateIssue} />
      <div className="sticky bottom-0 h-10 border-t bg-white">
        <Button
          onClick={() => setIsCreatingEpic(true)}
          data-state={isCreatingEpic ? "closed" : "open"}
          customColors
          className="flex w-full items-center gap-x-1.5 hover:bg-gray-100 [&[data-state=closed]]:hidden"
        >
          <AiOutlinePlus />
          <span className="text-[14px] font-medium">Create Epic</span>
        </Button>
        <EmtpyIssue
          data-state={isCreatingEpic ? "open" : "closed"}
          className="[&[data-state=closed]]:hidden"
          onCreate={({ name }) =>
            handleCreateIssue({
              name,
              type: "EPIC",
              sprintColor: LIGHT_COLORS[0]?.hex ?? null,
            })
          }
          onCancel={() => setIsCreatingEpic(false)}
          isCreating={isCreating}
          isEpic
        />
      </div>
    </div>
  );
};

const EpicsAccordion: React.FC<{
  handleCreateIssue: (props: CreateIssueProps) => void;
}> = ({ handleCreateIssue }) => {
  const [creationParent, setCreationParent] = useState<number | null>(null);
  const { setIssueKey } = useSelectedIssueContext();
  const { issues, isCreating } = useIssues();
  const { search, assignees, issueTypes, epics, sprints } = useFiltersContext();
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const filterIssues = useCallback(
    (issues: IssueType[] | undefined) => {
      if (!issues) return [];
      return issues.filter((issue) => {
        if (!isSubtask(issue)) {
          if (issueNotInSearch({ issue, search })) return false;
          if (assigneeNotInFilters({ issue, assignees })) return false;
          if (epicNotInFilters({ issue, epics })) return false;
          if (issueTypeNotInFilters({ issue, issueTypes })) return false;
          if (
            issueSprintNotInFilters({
              issue,
              sprintIds: sprints,
              excludeBacklog: true,
            })
          ) {
            return false;
          }
          return true;
        }
        return false;
      });
    },
    [search, assignees, epics, issueTypes, sprints]
  );

  return (
    <Accordion
      value={openAccordions}
      onValueChange={setOpenAccordions}
      type="multiple"
      className="overflow-hidden"
    >
      {issues
        ?.filter((issue) => issue.type == "EPIC")
        .map((issue, index) => (
          <AccordionItem key={issue.id} value={issue.key}>
            <div className="flex w-full items-center justify-between hover:bg-gray-200">
              <AccordionTrigger>
                <FaChevronRight className="mr-2 text-xs transition-transform" />
              </AccordionTrigger>
              <div className="flex flex-grow items-center py-1.5">
                <IssueIcon issueType="EPIC" />
                <div className="ml-3 text-sm">{issue.name}</div>
              </div>
              <Button
                customColors
                onClick={() => setCreationParent(index)}
                className="mr-2 hover:bg-gray-300"
              >
                <AiOutlinePlus />
              </Button>
            </div>
          </AccordionItem>
        ))}
    </Accordion>
  );
};

export { EpicsTable };
