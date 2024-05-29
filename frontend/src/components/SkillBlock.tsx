/**
 * Skill block used on the skill page.
 */

import React from "react";
import toast from "react-hot-toast";
import { HiDotsHorizontal, HiTrash } from "react-icons/hi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "flowbite-react";
import { blobToString } from "utils";

import api from "api";

function SkillBlock(props: { skill: Skill }): JSX.Element {
  const { skill } = props;
  const queryClient = useQueryClient();
  const [hidden, setHidden] = React.useState("hidden");
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Add hover effects.
  const showButton = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void => {
    e.preventDefault();
    setHidden("");
  };

  const hideButton = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void => {
    e.preventDefault();
    setHidden("hidden");
  };

  const { data: image } = useQuery({
    queryKey: ["images", skill.imageId],
    queryFn: async (): Promise<string> => {
      if (skill.imageId != null) {
        const response = await api.get(`/skills/images/${skill.imageId}`, {
          responseType: "blob",
        });
        const image = await blobToString(response.data);
        return image ?? "";
      }
      return "";
    },
  });

  const deleteUserSkill = useMutation({
    mutationFn: async () => {
      await api.delete(`/skills/users/${skill._id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userSkills"] });
      toast.success("Skill deleted!");
    },
  });

  return (
    <div
      className={`flex justify-end px-4 py-2.5 rounded ${
        skill.bgColour !== undefined && skill.bgColour !== ""
          ? skill.bgColour
          : "bg-gray-100"
      }`}
      onMouseEnter={(e) => {
        showButton(e);
      }}
      onMouseLeave={(e) => {
        if (!dropdownOpen) {
          hideButton(e);
        }
      }}
    >
      <div className={`absolute ${hidden}`}>
        <Dropdown
          label={<HiDotsHorizontal />}
          placement="bottom-end"
          arrowIcon={false}
          color="dark"
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
          }}
          onBlur={() => {
            setDropdownOpen(false);
            setHidden("hidden");
          }}
          data-testid="skill-dropdown-button"
        >
          <Dropdown.Item
            icon={HiTrash}
            onClick={() => {
              deleteUserSkill.mutate();
            }}
            data-testid="delete-skill"
          >
            Delete
          </Dropdown.Item>
        </Dropdown>
      </div>
      {skill.imageId === "" || skill.imageId == null ? null : (
        <img
          // Load image from base64 string.
          src={image}
          alt={skill.name}
          className="mr-2 object-contain h-6 w-6"
        />
      )}
      <h2
        className={`text-left font-bold ${
          skill.textColour !== undefined && skill.textColour !== ""
            ? skill.textColour
            : "text-gray-800"
        }`}
      >
        {skill.name}
      </h2>
    </div>
  );
}

export default SkillBlock;
