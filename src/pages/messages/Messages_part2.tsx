return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {!apiAvailable && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-2">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                The messaging API endpoints are not available. Using mock data for development purposes.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-1">
        {/* Threads Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search messages..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search messages"
              />
            </div>
          </div>

          {/* Start New Chat Section */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">Start New Chat</h4>
            <div className="max-h-40 overflow-y-auto">
              {isLoading && allUsers.length === 0 ? (
                <div className="text-xs text-gray-400">Loading users...</div>
              ) : (
                <>
                  {allUsers
                    .filter((u) => {
                      const displayName = getDisplayName(u);
                      return displayName.toLowerCase().includes(searchTerm.toLowerCase());
                    })
                    .map((u) => {
                      const displayName = getDisplayName(u);
                      return (
                        <button
                          key={u.id}
                          className="flex items-center w-full p-2 rounded hover:bg-gray-100 text-left"
                          onClick={() => setSelectedThread(threads.find(t => t.participant?.id === u.id) || null)}
                          disabled={isLoading}
                        >
                          <Avatar name={displayName} size="sm" className="mr-2" />
                          <span className="text-sm">{displayName} ({u.role || 'User'})</span>
                        </button>
                      );
                    })}
                  {allUsers.length === 0 && !isLoading && (
                    <div className="text-xs text-gray-400">No users found</div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Existing Threads */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && filteredThreads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-pulse">Loading conversations...</div>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations found
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const displayName = getDisplayName(thread.participant);
                return (
                  <button
                    key={thread.id}
                    className={`w-full p-4 text-left hover:bg-gray-50 focus:outline-none ${
                      selectedThread?.id === thread.id ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => setSelectedThread(thread)}
                    disabled={isLoading}
                  >
                    <div className="flex items-center">
                      <Avatar name={displayName} size="md" className="mr-3" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {displayName} {thread.participant.role && `(${thread.participant.role})`}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {thread.lastMessage?.timestamp
                              ? formatDate(thread.lastMessage.timestamp, 'h:mm a')
                              : 'No messages yet'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {thread.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      {thread.unreadCount > 0 && (
                        <span className="ml-2 bg-primary-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedThread ? (
            <ChatRoomPage threadId={selectedThread.id} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              {isLoading ? (
                <div className="animate-pulse">Loading conversations...</div>
              ) : (
                <div>Select a chat or start a new conversation</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
