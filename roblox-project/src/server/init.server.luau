local Players = game:GetService("Players")
Players.PlayerAdded:Connect(function(plr)
	print("Player added: " .. plr.Name)
    
end)
Players.PlayerRemoving:Connect(function(plr)
	print("Player removed: " .. plr.Name)
end)