"use client"

import {
  Award,
  ChevronLeft,
  ChevronRight,
  Crown,
  ExternalLink,
  FileCode,
  Filter,
  FolderGit,
  Gift,
  Hash as HashIcon,
  Layers,
  MapPin,
  Medal,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React, { useCallback, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SUPPORTED_CHAINS, getChainById } from "@/lib/config"
import type { DeploymentRecordBase } from "@/lib/types"
import { cn, getExplorerUrl, getIpfsUrl } from "@/lib/utils"
import { polygonAmoy } from "viem/chains"

type CategoryFilter = "my-contracts" | "all-contracts" | "leaderboard" | "rewards"

const ACTIVE_REWARDS_CHAIN_ID = polygonAmoy.id
const ITEMS_PER_PAGE = 9
const LEADERBOARD_LIMIT = 10

interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
}

interface FilterState {
  selectedChain: number | null
  activeCategory: CategoryFilter
}

export function ContractsDashboard({
  userDeployments,
  allDeployments,
}: {
  userDeployments: DeploymentRecordBase[]
  allDeployments: DeploymentRecordBase[]
}) {
  const [filters, setFilters] = useState<FilterState>({
    selectedChain: null,
    activeCategory: "my-contracts",
  })

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  })

  // Generate unique keys for deployments to avoid duplication
  const generateUniqueKey = useCallback((deployment: DeploymentRecordBase, index: number): string => {
    return `${deployment.chainId}-${deployment.contractAddress}-${deployment.deployHash}-${index}`
  }, [])

  // Deduplicate deployments based on contract address and chain ID
  const deduplicatedUserDeployments = useMemo(() => {
    const seen = new Set<string>()
    return userDeployments.filter((deployment) => {
      const key = `${deployment.chainId}-${deployment.deployHash}-${deployment.cid}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [userDeployments])

  const deduplicatedAllDeployments = useMemo(() => {
    const seen = new Set<string>()
    return allDeployments.filter((deployment) => {
      const key = `${deployment.chainId}-${deployment.deployHash}-${deployment.cid}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [allDeployments])

  const currentDeployments = useMemo(() => {
    return filters.activeCategory === "my-contracts" ? deduplicatedUserDeployments : deduplicatedAllDeployments
  }, [filters.activeCategory, deduplicatedUserDeployments, deduplicatedAllDeployments])

  const filteredDeployments = useMemo(() => {
    return currentDeployments.filter((deployment) => {
      const matchesChain = filters.selectedChain === null || deployment.chainId === filters.selectedChain
      return matchesChain
    })
  }, [currentDeployments, filters.selectedChain])

  const deploymentsByChain = useMemo(() => {
    const grouped = currentDeployments.reduce<Record<number, number>>((acc, deployment) => {
      const chainId = deployment.chainId
      if (!acc[chainId]) acc[chainId] = 0
      acc[chainId]++
      return acc
    }, {})
    return grouped
  }, [currentDeployments])

  // Pagination logic
  const paginatedDeployments = useMemo(() => {
    if (filters.activeCategory === "leaderboard" || filters.activeCategory === "rewards") {
      return filteredDeployments
    }

    const startIndex = (pagination.currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredDeployments.slice(startIndex, endIndex)
  }, [filteredDeployments, pagination.currentPage, filters.activeCategory])

  // Update pagination when filtered deployments change
  useEffect(() => {
    const totalItems =
      filters.activeCategory === "leaderboard"
        ? Math.min(filteredDeployments.length, LEADERBOARD_LIMIT)
        : filteredDeployments.length

    const totalPages =
      filters.activeCategory === "leaderboard" || filters.activeCategory === "rewards"
        ? 1
        : Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

    setPagination((prev) => ({
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage,
      totalPages,
      totalItems,
    }))
  }, [filteredDeployments.length, filters.activeCategory])

  const selectChainFilter = useCallback((chainId: number) => {
    setFilters((prev) => ({
      ...prev,
      selectedChain: prev.selectedChain === chainId ? null : chainId,
    }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, selectedChain: null }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [])

  const setActiveCategory = useCallback((category: CategoryFilter) => {
    setFilters((prev) => ({
      ...prev,
      activeCategory: category,
      selectedChain: null, // Reset chain filter when changing category
    }))
    setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 })
  }, [])

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        setPagination((prev) => ({ ...prev, currentPage: page }))
      }
    },
    [pagination.totalPages],
  )

  const categoryButtons = [
    {
      id: "my-contracts" as const,
      label: "My Contracts",
      icon: Users,
      count: deduplicatedUserDeployments.length,
      description: "View and manage your deployed smart contracts",
    },
    {
      id: "all-contracts" as const,
      label: "All Contracts",
      icon: Layers,
      count: deduplicatedAllDeployments.length,
      description: "Explore deployed smart contracts",
    },
    {
      id: "leaderboard" as const,
      label: "Leaderboard",
      icon: Trophy,
      count: null,
      description: "Track rankings and compete with other builders",
    },
    {
      id: "rewards" as const,
      label: "Rewards",
      icon: Gift,
      count: null,
      description: "Earn rewards for completing deployment challenges",
    },
  ]

  const activeDescription = categoryButtons.find((cat) => cat.id === filters.activeCategory)?.description

  // Filter leaderboard deployments by chain
  const leaderboardDeployments = useMemo(() => {
    const deployments = deduplicatedAllDeployments.filter((deployment) => {
      const matchesChain = filters.selectedChain === null || deployment.chainId === filters.selectedChain
      return matchesChain
    })
    return deployments.slice(0, LEADERBOARD_LIMIT)
  }, [deduplicatedAllDeployments, filters.selectedChain])

  // Get filtered chains for rewards
  const rewardChains = useMemo(() => {
    return filters.selectedChain
      ? SUPPORTED_CHAINS.filter((chain) => chain.id === filters.selectedChain)
      : SUPPORTED_CHAINS
  }, [filters.selectedChain])

  // Pagination component
  const PaginationControls = () => {
    if (
      filters.activeCategory === "leaderboard" ||
      filters.activeCategory === "rewards" ||
      pagination.totalPages <= 1
    ) {
      return null
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="hidden md:block text-sm text-muted-foreground">
          Showing {(pagination.currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
          {Math.min(pagination.currentPage * ITEMS_PER_PAGE, pagination.totalItems)} of {pagination.totalItems}{" "}
          deployments
        </div>
        <div className="max-sm:w-full max-sm:justify-center flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden md:block">Previous</span>
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(2, pagination.totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={pagination.currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              )
            })}
            {pagination.totalPages > 2 && (
              <>
                {pagination.currentPage > 2 && pagination.currentPage < pagination.totalPages - 1 ? (
                  <Button variant={"default"} size="sm" className="w-8 h-8 p-0">
                    {pagination.currentPage}
                  </Button>
                ) : (
                  <Button variant={"outline"} size="sm" className="w-8 h-8 p-0">
                    ...
                  </Button>
                )}
                {Array.from({ length: Math.min(2, pagination.totalPages) }, (_, i) => {
                  const page = pagination.totalPages + i - 1
                  return (
                    <Button
                      key={page}
                      variant={pagination.currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  )
                })}
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            <span className="hidden md:block">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Contract Deployments</h1>
              <p className="text-muted-foreground mt-1">{activeDescription}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>
                {filters.activeCategory === "leaderboard"
                  ? `${leaderboardDeployments.length} recent deployments`
                  : filters.activeCategory === "rewards"
                    ? `${rewardChains.length} chains`
                    : `${filteredDeployments.length} deployments`}
                {filters.selectedChain && ` on ${getChainById(filters.selectedChain)?.name}`}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="group hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/15 transition-colors">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Chain</p>
                  <p className="text-2xl font-bold">
                    {filters.selectedChain ? getChainById(filters.selectedChain)?.name : "All"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/15 transition-colors">
                  <FolderGit className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {filters.activeCategory === "my-contracts" ? "Your" : "Total"} Contracts
                  </p>
                  <p className="text-2xl font-bold">
                    {filters.activeCategory === "my-contracts"
                      ? deduplicatedUserDeployments.length
                      : deduplicatedAllDeployments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/15 transition-colors">
                  <HashIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Chains</p>
                  <p className="text-2xl font-bold">
                    {filters.activeCategory === "rewards" ? 1 : Object.keys(deploymentsByChain).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unified Filters */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            {/* Category Buttons */}
            <div className="p-4 pb-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categoryButtons.map((category) => {
                  const isActive = filters.activeCategory === category.id
                  const Icon = category.icon

                  return (
                    <Button
                      key={category.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(category.id)}
                      className={cn(
                        "h-10 px-3 text-xs font-medium transition-all justify-start group",
                        isActive && "shadow-sm",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 mr-2 flex-shrink-0 transition-transform",
                          isActive && "scale-110",
                          !isActive && "group-hover:scale-110",
                        )}
                      />
                      <span className="truncate">{category.label}</span>
                      {category.count !== null && (
                        <Badge
                          variant={isActive ? "secondary" : "outline"}
                          className="ml-auto h-4 px-1 text-xs min-w-[1.25rem] flex items-center justify-center"
                        >
                          {category.count}
                        </Badge>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border mx-4 mt-4" />

            {/* Chain Filters */}
            <div className="p-4">
              <div className="space-y-3">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Chain Filters</span>
                  </div>
                  {filters.selectedChain !== null && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-5 px-2 text-xs hover:bg-destructive/10 hover:text-destructive transition-all group"
                    >
                      <X className="h-3 w-3 mr-1 group-hover:rotate-90 transition-transform" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Chain Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {SUPPORTED_CHAINS.map((chainInfo) => {
                    const deploymentCount = deploymentsByChain[chainInfo.id] || 0
                    const isSelected = filters.selectedChain === chainInfo.id

                    return (
                      <Button
                        key={`button-${chainInfo.id}`}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => selectChainFilter(chainInfo.id)}
                        className={cn(
                          "h-9 px-3 text-xs font-medium transition-all justify-start group",
                          isSelected && "shadow-sm",
                          isSelected && chainInfo.iconBackground,
                          !isSelected && "hover:border-primary/50",
                        )}
                      >
                        <Image
                          src={chainInfo.iconUrl}
                          alt={chainInfo.name}
                          width={16}
                          height={16}
                          className={cn(
                            "mr-2 flex-shrink-0 transition-transform",
                            !isSelected && "group-hover:scale-110",
                          )}
                        />
                        <span className="truncate">{chainInfo.name}</span>
                        {(filters.activeCategory === "my-contracts" || filters.activeCategory === "all-contracts") && (
                          <Badge
                            variant={isSelected ? "secondary" : "outline"}
                            className="ml-auto h-4 px-1 text-xs min-w-[1.25rem] flex items-center justify-center"
                          >
                            {deploymentCount}
                          </Badge>
                        )}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        {filters.activeCategory === "leaderboard" ? (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Contracts Leaderboard
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Top Deployments
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboardDeployments.length > 0 ? (
                  leaderboardDeployments.map((deployment, index) => {
                    const chain = getChainById(deployment.chainId)
                    const isTop3 = index < 3
                    const icon = index === 0 ? Crown : index === 1 ? Medal : index === 2 ? Award : Trophy
                    const iconColor =
                      index === 0
                        ? "text-yellow-500 dark:text-yellow-400"
                        : index === 1
                          ? "text-zinc-400 dark:text-zinc-500"
                          : index === 2
                            ? "text-amber-600 dark:text-amber-500"
                            : "text-muted-foreground"

                    return (
                      <div
                        key={generateUniqueKey(deployment, index)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg group",
                          "bg-muted/30",
                          isTop3 && "ring-1",
                          index === 0 &&
                            "ring-yellow-400 dark:ring-yellow-500/80 bg-yellow-50/90 dark:bg-yellow-400/20",
                          index === 1 && "ring-gray-300 dark:ring-gray-400/70 bg-gray-100/40 dark:bg-gray-400/20",
                          index === 2 && "ring-yellow-500 dark:ring-amber-500/60 bg-yellow-600/30 dark:bg-amber-700/15",
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-muted-foreground w-7 text-center font-semibold">
                              #{index + 1}
                            </span>
                            {React.createElement(icon, { className: cn("h-4 w-4", iconColor) })}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium font-mono text-sm truncate">{deployment.contractAddress}</p>
                              {chain && (
                                <Link
                                  href={getExplorerUrl({
                                    viemChain: chain,
                                    hash: deployment.contractAddress,
                                    type: "address",
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                </Link>
                              )}
                            </div>
                            {chain && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <Image src={chain.iconUrl} alt={chain.name} width={14} height={14} />
                                <p className="text-xs text-muted-foreground">{chain.name}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={isTop3 ? "default" : "secondary"} className="text-xs">
                            {isTop3 ? "Bonus" : "Earning"}
                          </Badge>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No deployments found</p>
                    <p className="text-sm mt-1">
                      {filters.selectedChain ? "Try selecting a different chain" : "Deploy contracts to appear here"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : filters.activeCategory === "rewards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewardChains.map((chain) => {
              const deploymentCount = deploymentsByChain[chain.id] || 0
              const hasDeployments = deploymentCount > 0

              return (
                <Card
                  key={`card-${chain.id}`}
                  className={cn(
                    "group relative overflow-hidden transition-all duration-300",
                    "hover:shadow-lg hover:-translate-y-1",
                    !hasDeployments && "opacity-75",
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5" />
                  <CardHeader className="relative pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", chain.iconBackground)}>
                          <Image src={chain.iconUrl} alt={chain.name} width={24} height={24} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{chain.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {hasDeployments ? `${deploymentCount} deployments` : "No deployments yet"}
                          </p>
                        </div>
                      </div>
                      <Gift className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="outline" className="text-xs">
                          {chain.id === ACTIVE_REWARDS_CHAIN_ID ? (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              <span>Tracking Active</span>
                            </>
                          ) : (
                            "Coming Soon"
                          )}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rewards</span>
                        <span className="font-medium">TBA</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Complete deployment challenges on {chain.name} to earn exclusive rewards and climb the
                        leaderboard!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : // Contracts Grid
        paginatedDeployments.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedDeployments.map((deployment, index) => {
                const chain = getChainById(deployment.chainId)

                return (
                  <Card
                    key={generateUniqueKey(deployment, index)}
                    className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-card"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold truncate">{deployment.contractAddress}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            {chain && (
                              <Badge variant="secondary" className="text-xs">
                                <Image src={chain.iconUrl} alt={chain.name} width={16} height={16} className="mr-1" />
                                {chain?.name || deployment.chainId}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Contract Address */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>Contract Address</span>
                        </div>
                        {chain ? (
                          <Link
                            href={getExplorerUrl({
                              viemChain: chain,
                              hash: deployment.contractAddress,
                              type: "address",
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors group"
                          >
                            <code className="text-xs font-mono truncate flex-1">{deployment.contractAddress}</code>
                            <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                          </Link>
                        ) : (
                          <code className="block p-2 bg-muted/50 rounded-lg text-xs font-mono truncate">
                            {deployment.contractAddress}
                          </code>
                        )}
                      </div>

                      {/* Transaction Hash */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <HashIcon className="h-3 w-3" />
                          <span>Transaction Hash</span>
                        </div>
                        {chain ? (
                          <Link
                            href={getExplorerUrl({
                              viemChain: chain,
                              hash: deployment.deployHash,
                              type: "tx",
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors group"
                          >
                            <code className="text-xs font-mono truncate flex-1">{deployment.deployHash}</code>
                            <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                          </Link>
                        ) : (
                          <code className="block p-2 bg-muted/50 rounded-lg text-xs font-mono truncate">
                            {deployment.deployHash}
                          </code>
                        )}
                      </div>

                      {/* IPFS Source */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileCode className="h-3 w-3" />
                          <span>IPFS Source Code</span>
                        </div>
                        <Link
                          href={getIpfsUrl(deployment.cid)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-colors group"
                        >
                          <code className="text-xs font-mono text-purple-700 dark:text-purple-300 truncate flex-1">
                            {deployment.cid}
                          </code>
                          <ExternalLink className="h-3 w-3 text-purple-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-shrink-0" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <PaginationControls />
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                <FolderGit className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {filteredDeployments.length === 0 ? "No deployments yet" : "No matching deployments"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {filteredDeployments.length === 0
                  ? filters.activeCategory === "my-contracts"
                    ? "Deploy your first smart contract to get started."
                    : "No contracts have been deployed yet."
                  : "Try adjusting your filter criteria."}
              </p>
              {filters.selectedChain !== null && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
