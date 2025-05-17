import { redirect } from "next/navigation";

import { getInterviewById } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import './styles.css'
import McqClient from "./McqClient";



const Mcq = async ({ params }: RouteParams) => {
    const { id } = await params;
    const user = await getCurrentUser();

    const interview = await getInterviewById(id);
    if (!interview) redirect("/");
    console.log(interview);

    return <McqClient interview={interview} id={id} />;
};

export default Mcq;
