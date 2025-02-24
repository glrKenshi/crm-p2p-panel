const useHttp = (apiKey) => {

    const request = async (url, method = 'GET', body = null, headers = {
        "Content-Type": "application/json",
        'Accept' : 'application/json',
        'X-API-KEY': apiKey
    }) => {

        try {
            const response = await fetch(url, {method, body, headers});

            if (!response.ok) {
                throw new Error(`Could not fetch ${url}, status: ${response.status}`);
            }

            const data = await response.json();

            return data;
        } catch(e) {
            throw e;
        }
    };

    return {
        request: request
    }
}

export default useHttp