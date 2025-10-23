import toast from "react-hot-toast";

async function checkResponse(response: Response) {
    if (response.ok) {
        return response.json();
    } else {
        // let msg;
        // try {
        //     const val = await response.json();
        //     msg = val.error ?? "";
        // } catch {
        //     msg = response.statusText;
        // }
        throw new Error(response.statusText);
    }
};

export default function toastify<T>(promise: Promise<T>, messages: { loading: string, success: string, error: string | ((err: Error) => string) }, successHandler: (val: T) => void, failureHandler: (val: T) => void) {
    toast.promise(promise, messages).then(successHandler).catch(failureHandler);
}

export function toastifyFetch<T>(url : string, options: RequestInit, messages: { loading: string, success: string, error: string | ((err: Error) => string) }, successHandler: (val: T) => void, failureHandler: (val: T) => void) {
    const fetchPromise = fetch(url, options).then(checkResponse);
    toastify<T>(fetchPromise, messages, successHandler, failureHandler);
}