import { ImageResponse } from "next/og"

import { getAgent, getSharedChat } from "@/app/actions"
import type { ChatPageProps } from "@/app/page"
import W3GPTLogo from "@/public/w3gpt-logo-beta.svg"

export const alt = "Web3 GPT"

export const size = {
  width: 1200,
  height: 630
}

export const contentType = "image/png"

const interRegular = fetch(new URL("/public/assets/fonts/Inter-Regular.woff", import.meta.url)).then((res) =>
  res.arrayBuffer()
)

const interBold = fetch(new URL("/public/assets/fonts/Inter-Bold.woff", import.meta.url)).then((res) =>
  res.arrayBuffer()
)

export default async function OpenGraphImage({ params, searchParams }: ChatPageProps) {
  const chat = await getSharedChat(params.id)
  const agentId = chat?.agentId || (searchParams?.a as string | undefined)
  const agent = agentId ? await getAgent(agentId) : null

  const textAlign = chat && chat.title.length > 40 ? "items-start" : "items-center"

  return new ImageResponse(
    <div tw="flex w-full items-start h-full flex-col bg-[#191817] text-white p-[80px]">
      <div tw="flex flex-col w-full pt-[40px]">
        <div tw={`flex w-full ${textAlign}`}>
          <div tw="flex h-18 w-18 items-center justify-center rounded-md border border-[#9b9ba4]">
            <svg
              role="img"
              aria-label="Chat"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              fill="currentColor"
              width={48}
              height={48}
            >
              <path d="M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0c-27.39 8.94-50.86 27.82-66.09 54.16a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8ZM72 96a56 56 0 1 1 56 56 56.06 56.06 0 0 1-56-56Z" />
            </svg>
          </div>
          <div tw="flex text-white font-bold text-4xl leading-normal ml-10">
            {chat ? (chat?.title?.length > 120 ? `${chat.title.slice(0, 120)}...` : chat.title) : "Start a chat"}
          </div>
        </div>
        <div tw="flex w-full mt-14 items-start">
          <div tw="flex h-18 w-18 items-center justify-center rounded-md border border-[#9b9ba4]">
            <svg
              role="img"
              aria-label="Chat"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              width={48}
              height={48}
            >
              <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
            </svg>
          </div>
          <div tw="flex text-white font-bold text-6xl leading-none ml-10">...</div>
        </div>
      </div>
      <div tw="flex items-center justify-between w-full mt-auto">
        <div tw="flex items-center">
          {agent ? (
            <div className="flex flex-col mx-auto  text-center items-center justify-center mb-8 max-w-2xl bg-background rounded-2xl border-gray-600/25 p-8 dark:border-gray-600/50 md:mb-12 md:border space-y-8">
              <img src={agent.imageUrl} alt={`${agent.name}`} width={160} height={160} />
              <div className="flex flex-col items-center justify-center w-full space-y-2">
                <p className="text-md font-bold tracking-tight lg:text-2xl lg:font-normal">Agent: {agent.name}</p>
                <p className="text-md font-normal tracking-tight lg:text-lg lg:font-normal">{agent.description}</p>
                <p className="text-sm font-normal tracking-tight lg:text-md lg:font-normal">
                  created by {agent.creator}
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto mb-8 max-w-2xl bg-background rounded-2xl border-gray-600/25 px-4 text-center dark:border-gray-600/50 md:mb-12 md:border">
              <div className="relative my-8 flex h-8 w-full md:my-12">
                <img src={W3GPTLogo} alt="web3 gpt logo" width={638} height={32} />
              </div>
              <p className="text-lg font-bold tracking-tight lg:text-2xl lg:font-normal">
                Deploy smart contracts with AI
              </p>

              <div className="grid-row-3 my-5 mb-8 grid grid-flow-row gap-1 md:grid-flow-col md:gap-4">
                <div className="mx-3 grid grid-cols-3 content-center gap-1 md:grid-cols-1 md:gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 500 500"
                    width="500"
                    height="500"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      transform: "translate3d(0,0,0)",
                      contentVisibility: "visible"
                    }}
                  >
                    <title>Puzzle</title>
                    <defs>
                      <filter id="a" filterUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
                        <feComponentTransfer in="SourceGraphic">
                          <feFuncA type="table" tableValues="1.0 0.0" />
                        </feComponentTransfer>
                      </filter>
                      <filter id="c" filterUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
                        <feComponentTransfer in="SourceGraphic">
                          <feFuncA type="table" tableValues="1.0 0.0" />
                        </feComponentTransfer>
                      </filter>
                      <mask id="g" mask-type="alpha">
                        <g filter="url(#a)">
                          <path fill="#fff" opacity="0" d="M0 0h500v500H0z" />
                          <use xlinkHref="#b" />
                        </g>
                      </mask>
                      <mask id="f" mask-type="alpha">
                        <g filter="url(#c)">
                          <path fill="#fff" opacity="0" d="M0 0h500v500H0z" />
                          <use xlinkHref="#d" />
                        </g>
                      </mask>
                      <g style={{ display: "block" }} id="b">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          fill-opacity="0"
                          stroke="#08A88A"
                          stroke-width="0"
                          d="M352.392 247.814c.987 5.163 1.506 9.625 1.506 12.64a24.87 24.87 0 0 1-24.876 24.876 24.87 24.87 0 0 1-24.877-24.877c0-3.014.523-7.476 1.51-12.639h-57.176v-57.292c5.163.987 9.625 1.506 12.64 1.506a24.87 24.87 0 0 0 24.876-24.876 24.87 24.87 0 0 0-24.876-24.877c-3.015 0-7.477.523-12.64 1.51V86.492c89.068.058 161.205 72.31 161.205 161.321z"
                        />
                        <path
                          fill="#08A88A"
                          d="M352.392 247.814c.987 5.163 1.506 9.625 1.506 12.64a24.87 24.87 0 0 1-24.876 24.876 24.87 24.87 0 0 1-24.877-24.877c0-3.014.523-7.476 1.51-12.639h-57.176v-57.292c5.163.987 9.625 1.506 12.64 1.506a24.87 24.87 0 0 0 24.876-24.876 24.87 24.87 0 0 0-24.876-24.877c-3.015 0-7.477.523-12.64 1.51V86.492c89.068.058 161.205 72.31 161.205 161.321z"
                        />
                        <g transform="translate(302.245 206.463)scale(3.87)" />
                      </g>
                      <g style={{ display: "block" }} id="d">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          fill-opacity="0"
                          stroke="#08A88A"
                          stroke-width="0"
                          d="M352.392 247.814c.987 5.163 1.506 9.625 1.506 12.64a24.87 24.87 0 0 1-24.876 24.876 24.87 24.87 0 0 1-24.877-24.877c0-3.014.523-7.476 1.51-12.639h-57.176v-57.292c5.163.987 9.625 1.506 12.64 1.506a24.87 24.87 0 0 0 24.876-24.876 24.87 24.87 0 0 0-24.876-24.877c-3.015 0-7.477.523-12.64 1.51V86.492c89.068.058 161.205 72.31 161.205 161.321z"
                        />
                        <path
                          fill="#08A88A"
                          d="M352.392 247.814c.987 5.163 1.506 9.625 1.506 12.64a24.87 24.87 0 0 1-24.876 24.876 24.87 24.87 0 0 1-24.877-24.877c0-3.014.523-7.476 1.51-12.639h-57.176v-57.292c5.163.987 9.625 1.506 12.64 1.506a24.87 24.87 0 0 0 24.876-24.876 24.87 24.87 0 0 0-24.876-24.877c-3.015 0-7.477.523-12.64 1.51V86.492c89.068.058 161.205 72.31 161.205 161.321z"
                        />
                        <g transform="translate(302.245 206.463)scale(3.87)" />
                      </g>
                      <clipPath id="e">
                        <path d="M0 0h500v500H0z" />
                      </clipPath>
                    </defs>
                    <g clip-path="url(#e)">
                      <g mask="url(#f)" style={{ display: "block" }}>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke="#393939"
                          stroke-width="12.461"
                          d="M409.625 250.252c-1.006 88.251-72.891 159.432-161.309 159.432v-57.292q0 0 0 0c-5.163.987-9.625 1.506-12.64 1.506a24.87 24.87 0 0 1-24.876-24.876 24.87 24.87 0 0 1 24.877-24.877c3.014 0 7.476.523 12.64 1.51v-56.49"
                          fill="none"
                        />
                        <g transform="rotate(90 -6.289 295.956)scale(3.87)" />
                      </g>
                      <g style={{ display: "block" }}>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke="#393939"
                          stroke-width="12.461"
                          d="M143.739 249.285c-.987-5.163-1.506-9.625-1.506-12.64a24.87 24.87 0 0 1 24.876-24.876 24.87 24.87 0 0 1 24.877 24.877c0 3.014-.523 7.476-1.51 12.64h57.176v57.29c-5.163-.986-9.625-1.505-12.64-1.505a24.87 24.87 0 0 0-24.876 24.876 24.87 24.87 0 0 0 24.876 24.877c3.015 0 7.477-.523 12.64-1.51v57.292c-89.068-.058-161.205-72.31-161.205-161.32z"
                          fill="none"
                        />
                        <g transform="rotate(180 96.943 145.318)scale(3.87)" />
                      </g>
                      <g mask="url(#g)" style={{ display: "block" }}>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke="#393939"
                          stroke-width="12.461"
                          d="M247.814 246.417v2.202h-57.292c.987-5.163 1.506-9.625 1.506-12.64a24.87 24.87 0 0 0-24.876-24.876 24.87 24.87 0 0 0-24.877 24.876c0 3.015.523 7.477 1.51 12.64H86.492c.058-87.47 69.737-158.608 156.541-161.135"
                          fill="none"
                        />
                        <g transform="rotate(-90 200.658 -5.805)scale(3.87)" />
                      </g>
                      <g style={{ display: "block" }}>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke="#20DA03"
                          stroke-width="12.461"
                          d="M352.392 247.814c.987 5.163 1.506 9.625 1.506 12.64a24.87 24.87 0 0 1-24.876 24.876 24.87 24.87 0 0 1-24.877-24.877c0-3.014.523-7.476 1.51-12.639h-57.176v-57.292c5.163.987 9.625 1.506 12.64 1.506a24.87 24.87 0 0 0 24.876-24.876 24.87 24.87 0 0 0-24.876-24.877c-3.015 0-7.477.523-12.64 1.51V86.492c89.068.058 161.205 72.31 161.205 161.321z"
                          fill="none"
                        />
                        <g transform="translate(302.245 206.463)scale(3.87)" />
                      </g>
                    </g>
                  </svg>
                  <div className="col-span-2 mt-4 text-left md:col-span-1 md:mt-0 md:text-center">
                    <h3 className="font-bold md:mb-2">Generate</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generate custom smart contracts using prompts.
                    </p>
                  </div>
                </div>

                <div className="mx-3 grid grid-cols-3 content-center gap-1 md:grid-cols-1 md:gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 500 500"
                    width="500"
                    height="500"
                    style={{
                      width: "100%",
                      height: "100%",
                      transform: "translate3d(0,0,0)",
                      contentVisibility: "visible"
                    }}
                  >
                    <title>Globe</title>
                    <defs>
                      <clipPath id="a">
                        <path d="M0 0h500v500H0z" />
                      </clipPath>
                      <clipPath id="b">
                        <path d="M0 0h500v500H0z" />
                      </clipPath>
                      <clipPath id="c">
                        <path d="M0 0h500v500H0z" />
                      </clipPath>
                    </defs>
                    <g clip-path="url(#a)">
                      <g
                        clip-path="url(#b)"
                        transform="translate(-27.777 -27.777)scale(1.11111)"
                        style={{ display: "block" }}
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="3.5"
                        fill="none"
                      >
                        <g
                          clip-path="url(#c)"
                          transform="matrix(.9 0 0 .9 25 25)"
                          style={{ display: "block" }}
                          stroke="#20DA03"
                        >
                          <path
                            d="M126.667 50c-17.029 0-30.834-22.386-30.834-50s13.805-50 30.834-50m0 100c.083-8.75.166-22.386.166-50s-.083-34.25-.166-50"
                            transform="translate(-217.488 249.997)scale(3.69)"
                            style={{ display: "block" }}
                          />
                          <path
                            d="M126.667 50C144.248 50 158.5 27.614 158.5 0s-14.252-50-31.833-50m-50 50h100"
                            transform="translate(-217.488 249.997)scale(3.69)"
                            style={{ display: "block" }}
                          />
                          <path
                            d="M158.993-38.138c-8.71 4.56-19.99 7.31-32.32 7.31s-23.61-2.75-32.33-7.31m0 76.278c8.71-4.56 19.99-7.31 32.32-7.31s23.61 2.75 32.33 7.31"
                            transform="translate(-217.484 249.997)scale(3.69)"
                            style={{ display: "block" }}
                          />
                        </g>
                        <path
                          stroke="#393939"
                          d="M176.667 0c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50"
                          transform="translate(-170.736 250)scale(3.321)"
                          style={{ display: "block" }}
                        />
                      </g>
                    </g>
                  </svg>
                  <div className="col-span-2 mt-4 text-left md:col-span-1 md:mt-0 md:text-center">
                    <h3 className="font-bold md:mb-2">Deploy</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Deploy smart contracts directly from the chat.
                    </p>
                  </div>
                </div>
                <div className="mx-3 grid grid-cols-3 content-center gap-1 md:grid-cols-1 md:gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 500 500"
                    width="500"
                    height="500"
                    style={{
                      width: "100%",
                      height: "100%",
                      transform: "translate3d(0,0,0)",
                      contentVisibility: "visible"
                    }}
                  >
                    <title>Clock</title>
                    <defs>
                      <clipPath id="a">
                        <path d="M0 0h500v500H0z" />
                      </clipPath>
                      <clipPath id="b">
                        <path d="M0 0h500v500H0z" />
                      </clipPath>
                    </defs>
                    <g clip-path="url(#a)">
                      <g
                        clip-path="url(#b)"
                        style={{ display: "block" }}
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="3.36"
                        fill="none"
                      >
                        <path
                          stroke="#393939"
                          d="M35.537 36.105c-19.526 19.526-51.184 19.526-70.71 0s-19.526-51.184 0-70.71 51.184-19.526 70.71 0 19.526 51.184 0 70.71"
                          transform="translate(250 250)scale(3.36996)"
                          style={{ display: "block" }}
                        />
                        <path
                          stroke="#20DA03"
                          d="M.182-.21v-34.361M.182.75l17.869-17.869"
                          transform="translate(250 250)scale(3.36996)"
                          style={{ display: "block" }}
                        />
                      </g>
                    </g>
                  </svg>

                  <div className="col-span-2 mt-4 text-left md:col-span-1 md:mt-0 md:text-center">
                    <h3 className="font-bold md:mb-2">Speed Up</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Skip the boilerplate, deploy contracts in seconds. No wallet, IDE, or setup required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div tw="text-[1.8rem] ml-auto text-[#9b9ba4]">w3gpt.ai</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: await interRegular,
          style: "normal",
          weight: 400
        },
        {
          name: "Inter",
          data: await interBold,
          style: "normal",
          weight: 700
        }
      ]
    }
  )
}
