import { IInput } from "./interface";

export default function Input(props: IInput){
    return (
        <input className="input input-bordered h-12 rounded-2xl border-slate-200 bg-slate-50 focus:border-emerald-500! focus:outline-none!" {...props} />
    )
}