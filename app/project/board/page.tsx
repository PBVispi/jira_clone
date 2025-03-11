import { Board } from "@/components/board";
import { type Metadata } from "next";
import { getQueryClient } from "@/utils/get-query-client";
import { Hydrate } from "@/utils/hydrate";
import { dehydrate } from "@tanstack/query-core";
import {
  getInitialIssuesFromServer,
  getInitialProjectFromServer,
  getInitialSprintsFromServer,
} from "@/server/functions";

export const metadata: Metadata = {
  title: "Board",
};

const BoardPage = async () => {
  const defaultUserId = "init-user"; // Default user ID instead of Clerk authentication
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(["issues"], () =>
      getInitialIssuesFromServer(defaultUserId)
    ),
    queryClient.prefetchQuery(["sprints"], () =>
      getInitialSprintsFromServer(defaultUserId)
    ),
    queryClient.prefetchQuery(["project"], getInitialProjectFromServer),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <Board />
    </Hydrate>
  );
};

export default BoardPage;
