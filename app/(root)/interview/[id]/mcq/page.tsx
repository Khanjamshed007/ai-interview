import { redirect } from "next/navigation";

import { getInterviewById, getResumeInterviewById } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import './styles.css'
import McqClient from "./McqClient";



const Mcq = async ({ params ,searchParams}: RouteParams) => {
    const { id } = await params;
    const { resume } = await searchParams;
    const user = await getCurrentUser();
    console.log(user)
    const interview = resume
        ? await getResumeInterviewById(id!)
        : await getInterviewById(id);
    if (!interview) redirect("/");

    return <McqClient interview={interview} id={id} />;
};

export default Mcq;
