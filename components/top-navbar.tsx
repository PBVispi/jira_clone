"use client";
import Image from "next/image";
import { Button } from "./ui/button";
import { AiFillGithub, AiFillStar } from "react-icons/ai";
import { useEffect, useState } from "react";

const TopNavbar: React.FC = () => {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchStars();
  }, []);

  async function fetchStars() {
    const response = await fetch(
      "https://api.github.com/repos/sebastianfdz/jira_clone"
    );
    if (!response.ok) {
      setStars(null);
      return;
    }
    const data = (await response.json()) as { stargazers_count: number };
    setStars(data.stargazers_count ?? null);
  }

  return (
    <div className="flex h-12 w-full items-center justify-between border-b px-4">
      <div className="flex items-center gap-x-2">
        <Image
          src="https://cdn.worldvectorlogo.com/logos/jira-3.svg"
          alt="Jira logo"
          width={25}
          height={25}
        />
        <span className="text-sm font-medium text-gray-600">Jira Clone</span>
        <Button
          href="https://github.com/sebastianfdz/jira_clone"
          target="_blank"
          className="ml-3 flex gap-x-2"
        >
        </Button>
        
      </div> 
      
      {/* HARDCODED USER DISPLAY */}
      <div className="flex items-center gap-x-2">
        <span className="text-sm font-medium text-gray-600">Paul Beudert</span>
        <Button className="bg-red-500 text-white px-3 py-1.5">Sign Out</Button>
      </div>
    </div>
  );
};

export { TopNavbar };
