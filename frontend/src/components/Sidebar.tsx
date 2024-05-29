/**
 * Generic sidebar component present in all screens except Login.
 */

import React from "react";
import { HiAcademicCap, HiLightBulb } from "react-icons/hi";
import { HiBookOpen, HiSquares2X2 } from "react-icons/hi2";
import { MdSettings } from "react-icons/md";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sidebar as FlowbiteSidebar } from "flowbite-react";

import api from "api";
import logo from "img/logo_large_transparent.png";

import AlphaTag from "./AlphaTag";

function Sidebar(): JSX.Element {
  // Fetch the user's workspaces.
  const { data: workspaces, isSuccess } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async (): Promise<Workspace[]> => {
      const response = await api.get("/workspaces");
      return response.data;
    },
  });

  return (
    <div className="flex flex-col h-screen fixed">
      <FlowbiteSidebar>
        <FlowbiteSidebar.Logo
          href="#"
          img={logo}
          imgAlt="Asterspark logo"
          className="flex my-4"
        >
          <div className="flex gap-2 items-center">
            <p>Asterspark</p>
            <div>
              <AlphaTag />
            </div>
          </div>
        </FlowbiteSidebar.Logo>
        <FlowbiteSidebar.Items>
          <FlowbiteSidebar.ItemGroup>
            {isSuccess && (
              <FlowbiteSidebar.Item
                as={Link}
                icon={HiSquares2X2}
                to={
                  // Users by default only have one workspace in the workspaces array
                  workspaces != null && workspaces.length > 0
                    ? `/workspaces/${workspaces[0]?._id}`
                    : ""
                }
              >
                Workspace
              </FlowbiteSidebar.Item>
            )}
            <FlowbiteSidebar.Item as={Link} icon={HiLightBulb} to="/skills">
              My Skills
            </FlowbiteSidebar.Item>
            <FlowbiteSidebar.Item as={Link} icon={HiBookOpen} to="/gunther">
              Gunther AI
            </FlowbiteSidebar.Item>
          </FlowbiteSidebar.ItemGroup>
          <FlowbiteSidebar.ItemGroup>
            <FlowbiteSidebar.Item as={Link} icon={HiAcademicCap} to="/tutorial">
              Tutorial
            </FlowbiteSidebar.Item>
            <FlowbiteSidebar.Item as={Link} icon={MdSettings} to="/settings">
              Settings
            </FlowbiteSidebar.Item>
          </FlowbiteSidebar.ItemGroup>
        </FlowbiteSidebar.Items>
      </FlowbiteSidebar>
    </div>
  );
}

export default Sidebar;
