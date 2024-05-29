/**
 * Feyman AI screen for an individual user.
 */

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, TextInput } from "flowbite-react";

import api from "api";
import Sidebar from "components/Sidebar";

import "../styles/scrollbar.css";

const initialMessages: GuntherMessage[] = [
  {
    sender: "ai",
    text: `This is a study tool that helps you learn specific concepts using the Feynman \
technique by simply following the provided prompts. Entering a message in this chat will \
automatically begin a study session.\n\nNote that there are a limited number of monthly study \
sessions available to users. Currently, refreshing the page will reset the session - please \
refrain from doing so to prevent your session quota from being wasted.`,
  },
  {
    sender: "ai",
    text: `Here is an overview of my implementation of the Feynman technique.\n\n1. Select a topic \
that you want to study.\n2. Explain the topic as if you were teaching it to someone.\n3. I will \
provide three follow-up questions based on your explanation.\n4. Answer the follow-up questions.\n\
5. Based on your responses, I will identify gaps in your understanding regarding the topic.\n6. \
Refer back to your notes to strengthen your understanding of the identified areas.\n7. Provide one \
last simplified explanation of the topic.`,
  },
  {
    sender: "ai",
    text: `DISCLAIMER: We cannot guarantee the accuracy of the information provided by Gunther AI.`,
  },
  {
    sender: "ai",
    text: `To begin, please enter the topic you would like to study.`,
  },
];

function Gunther(): JSX.Element {
  const [messages, setMessages] =
    React.useState<GuntherMessage[]>(initialMessages);
  const [message, setMessage] = React.useState<string>("");
  const [stage, setStage] = React.useState<string>("intro");
  const [disabled, setDisabled] = React.useState<boolean>(false);
  const [topic, setTopic] = React.useState<string>("");
  const [explanation, setExplanation] = React.useState<string>("");
  const messagesBottomRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const scrollToBottom = (): void => {
    messagesBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { data: guntherSessions, isSuccess } = useQuery({
    queryKey: ["guntherSessions"],
    queryFn: async (): Promise<number> => {
      const { data: guntherSessions } = await api.get<GuntherSessions>(
        "/gunther"
      );

      return guntherSessions.sessions;
    },
  });

  React.useEffect(() => {
    if (isSuccess && guntherSessions <= 0) {
      setDisabled(true);
      // Send one last request to the endpoint to disable usage.
      startGuntherSession.mutate();
    }
  }, [isSuccess]);

  const startGuntherSession = useMutation({
    mutationFn: async () => {
      await api.post(`/gunther`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["guntherSessions"] });
    },
  });

  const followUpQuestions = useMutation({
    mutationFn: async (variables: { topic: string; explanation: string }) => {
      const { topic, explanation } = variables;
      // Longer running request, so need a longer timeout.
      return (
        await api.post(
          `/gunther/followUp`,
          {
            topic,
            explanation,
          },
          { timeout: 20000 }
        )
      ).data;
    },
    onSuccess: async (data) => {
      const newMessage: GuntherMessage = { sender: "ai", text: data };
      setMessages([...messages, newMessage]);
      setDisabled(false);
    },
  });

  const gaps = useMutation({
    mutationFn: async (variables: {
      topic: string;
      explanation: string;
      questions: string;
      responses: string;
    }) => {
      const { topic, explanation, questions, responses } = variables;
      // Longer running request, so need a longer timeout.
      return (
        await api.post(
          `/gunther/gaps`,
          {
            topic,
            explanation,
            questions,
            responses,
          },
          { timeout: 20000 }
        )
      ).data;
    },
    onSuccess: async (data) => {
      const newMessages: GuntherMessage[] = [{ sender: "ai", text: data }];
      newMessages.push({
        sender: "ai",
        text: `Once you feel confident in your knowledge of the topic, please provide a simplified \
explanation of it.`,
      });
      setMessages([...messages, ...newMessages]);
      setDisabled(false);
    },
  });

  const handeSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const newMessages: GuntherMessage[] = [{ sender: "user", text: message }];
    if (stage === "intro") {
      startGuntherSession.mutate();
      setTopic(message);
      newMessages.push({
        sender: "ai",
        text: `Okay, please explain ${message} as if you were teaching it to me.`,
      });
      setStage("explain");
    } else if (stage === "explain") {
      setDisabled(true);
      setExplanation(message);
      newMessages.push({
        sender: "ai",
        text: `Here are some follow up questions based on your explanation. Please answer them \
all on the same line, numbering each response.`,
      });
      followUpQuestions.mutate({ topic, explanation: message });
      setStage("answer");
    } else if (stage === "answer") {
      setDisabled(true);
      newMessages.push({
        sender: "ai",
        text: `Here are some gaps in your understanding that I've identified. Refer back to \
your notes and try to understand them.`,
      });
      gaps.mutate({
        topic,
        explanation,
        questions: messages.at(-1)?.text ?? "",
        responses: message,
      });
      setStage("simplify");
    } else if (stage === "simplify") {
      setDisabled(true);
      newMessages.push({
        sender: "ai",
        text: `That concludes your study session. If you would like to restart, click the \
restart button below.`,
      });
      setStage("done");
    } else {
      newMessages.push({ sender: "ai", text: "I don't understand." });
    }
    setMessages([...messages, ...newMessages]);
    setMessage("");
  };

  return (
    <div className="flex overflow-hidden bg-white dark:bg-gray-900 h-screen">
      <Sidebar />
      {isSuccess && (
        <div className="ml-64 w-screen h-full overflow-hidden flex flex-col">
          <div
            className="text-3xl font-bold text-gray-900 dark:text-white mx-16 mt-8"
            data-testid="gunther-title"
          >
            Gunther AI
          </div>
          <div className="border-4 my-4 mx-16 p-4 flex flex-col justify-end grow overflow-hidden">
            <div className="flex flex-col h-full overflow-auto">
              {messages.map((message, index) => (
                <Card
                  key={index}
                  className={`w-2/5 mb-4 text-gray-300 whitespace-pre-wrap ${
                    message.sender === "ai" ? "self-start" : "self-end"
                  }`}
                >
                  {message.text}
                </Card>
              ))}
              <div ref={messagesBottomRef} />
            </div>
            <form className="flex my-4 w-full" onSubmit={handeSubmit}>
              <TextInput
                className="w-full mr-4"
                placeholder="Message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                disabled={disabled}
                maxLength={3750}
              />
              <Button className="w-16" type="submit" disabled={disabled}>
                Send
              </Button>
            </form>
          </div>
          <Button
            className="self-center mx-16 mb-2 w-48"
            onClick={() => {
              setMessages(initialMessages);
              setStage("intro");
              if (guntherSessions > 0) {
                setDisabled(false);
              } else {
                setDisabled(true);
                // Send one last request to the endpoint to disable usage.
                startGuntherSession.mutate();
              }
            }}
          >
            Restart Session
          </Button>
          <div className="text-center text-gray-900 mb-8 dark:text-white">
            You have {guntherSessions} study sessions remaining this month.
          </div>
        </div>
      )}
    </div>
  );
}

export default Gunther;
