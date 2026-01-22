import { type FC, memo } from "react"
import ReactMarkdown, { type Options } from "react-markdown"

type MarkdownProps = Options & {
  className?: string
}

const MarkdownWrapper: FC<MarkdownProps> = ({ className, ...props }) => (
  <div className={className}>
    <ReactMarkdown {...props} />
  </div>
)

export const MemoizedReactMarkdown: FC<MarkdownProps> = memo(
  MarkdownWrapper,
  (prevProps, nextProps) => prevProps.children === nextProps.children && prevProps.className === nextProps.className
)
