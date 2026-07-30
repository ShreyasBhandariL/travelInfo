import { googleSignOut } from "@/app/actions/auth";

export default function Logout ({username} : {username?: String | null}) {
    return(
        <form action={googleSignOut}>
            <button type="submit" className="bg-white-600 text-black font-medium cursor-pointer px-4 py-2 rounded-lg border-gray-500 border btn text-xs font-medium">Logout ({username})</button>
        </form>
    )
}