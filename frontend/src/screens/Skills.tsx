/**
 * Skills screen for an individual user.
 */

import React from "react";
import toast from "react-hot-toast";
import { HiSearch } from "react-icons/hi";
import Autocomplete from "@mui/material/Autocomplete";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TextInput } from "flowbite-react";

import api from "api";
import Sidebar from "components/Sidebar";
import SkillBlock from "components/SkillBlock";

import "../styles/scrollbar.css";

function Skills(): JSX.Element {
  const queryClient = useQueryClient();
  const [value, setValue] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState("");

  const { data: skills, isSuccess: isSkillsSuccess } = useQuery({
    queryKey: ["skills"],
    queryFn: async (): Promise<Record<string, any>> => {
      const { data: skills } = await api.get<Skill[]>("/skills");

      const skillMap: Record<string, any> = {};
      skills.forEach((skill) => {
        skillMap[skill._id] = skill;
      });

      return skillMap;
    },
  });

  const { data: userSkills, isSuccess: isUserSkillsSuccess } = useQuery({
    queryKey: ["userSkills"],
    queryFn: async (): Promise<string[]> => {
      const { data: userSkills } = await api.get<string[]>("/skills/users");

      return userSkills;
    },
  });

  const addUserSkill = useMutation({
    mutationFn: async (skillId: string) => {
      await api.post(`/skills/users/${skillId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userSkills"] });
      toast.success("Skill added!");
    },
  });

  return (
    <div className="flex overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar />
      <div className="ml-64 w-screen h-screen overflow-hidden">
        <div className="h-full overflow-scroll">
          <div
            className="text-3xl font-bold text-gray-900 dark:text-white mx-16 mt-20 mb-6"
            data-testid="skills-title"
          >
            My Skills
          </div>
          {isSkillsSuccess && (
            <div>
              <div className="text-base text-gray-900 dark:text-white mx-16 mb-1">
                Please select a skill from the dropdown menu to add it to your
                skills section.
              </div>
              <Autocomplete
                options={Object.values(skills)}
                getOptionLabel={(option) => option.name}
                componentsProps={{
                  paper: {
                    className: "dark:bg-gray-700 dark:text-gray-400",
                  },
                }}
                renderInput={(params) => (
                  <div ref={params.InputProps.ref}>
                    <TextInput
                      addon={<HiSearch />}
                      {...params.inputProps}
                      placeholder="Search for a skill"
                      theme={{
                        addon:
                          "inline-flex items-center rounded-l-md border border-r-0 px-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                      }}
                    />
                  </div>
                )}
                value={value}
                onChange={(event, newValue) => {
                  if (newValue != null) {
                    setValue(null);
                    setInputValue("");
                    addUserSkill.mutate(newValue._id);
                  }
                }}
                inputValue={inputValue}
                onInputChange={(event, newInputValue) => {
                  setInputValue(newInputValue);
                }}
                className="mx-16"
              />
              <div className="flex flex-wrap gap-4 m-16">
                {isUserSkillsSuccess &&
                  userSkills.map((skillId) => {
                    return <SkillBlock skill={skills[skillId]} key={skillId} />;
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Skills;
