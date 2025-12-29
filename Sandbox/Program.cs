// See https://aka.ms/new-console-template for more information
using Sandbox;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

internal class Program
{
    private static async Task Main(string[] args)
    {
        var json = await File.ReadAllTextAsync("C:\\Users\\verme\\Downloads\\psalter_oldschema.json");
        var oldSchema = JsonSerializer.Deserialize<List<OldSchema>>(json);
        var newSchema = oldSchema.Select(x => Convert(x)).ToList();

        File.WriteAllText("C:\\Users\\verme\\source\\repos\\Psalter2025\\Psalter2025\\src\\assets\\1912\\psalter.json", JsonSerializer.Serialize(newSchema, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            WriteIndented = true,
        }));
    }

    private static NewSchema Convert(OldSchema old)
    {
        var oldVerses = old.lyrics.Split("\n\n").ToList();
        var chorus = oldVerses.FirstOrDefault(x => x.StartsWith("(CHORUS"));

        if (chorus != null)
        {
            oldVerses.Remove(chorus);
            chorus = chorus.Substring(chorus.IndexOf("\n")).Trim();
        }

        var newSchema = new NewSchema
        {
            Number = old.number,
            SecondTune = old.Title.Contains("2nd") ? true : null,

            Title = old.heading,
            Psalm = old.psalm?.ToString(),
            Verses = oldVerses.Select(x => RemoveVerseNumber(x).Trim()).ToList(),
            Chorus = chorus,
            NumVersesInsideStaff = old.NumVersesInsideStaff,
            ScoreFiles = ["assets\\" + old.scoreFileName],            
        };

        newSchema.AudioFile = $"assets\\1912\\Audio\\_{old.number}{(newSchema.SecondTune.GetValueOrDefault() ? "_2" : "")}.mp3";
        if (!File.Exists($"C:\\Users\\verme\\source\\repos\\Psalter2025\\Psalter2025\\src\\{newSchema.AudioFile}"))
            newSchema.AudioFile = null;

        return newSchema;
    }

    public static string RemoveVerseNumber(string verse)
    {
        var i = verse.IndexOf(". ");
        return verse.Substring(i + 2);
    }
}

public class OldSchema
{
    public int NumVersesInsideStaff { get; set; }
    public string Title {get; set;}
    public int _id {get; set;}
    public string audioFileName {get; set;}
    public string heading {get; set;}
    public int isFavorite {get; set;}
    public string lyrics {get; set;}
    public int number {get; set;}
    public int numverses {get; set;}
    public int? psalm {get; set;}
    public string scoreFileName { get; set; }
}

public class NewSchema
{
    public required int Number { get; set; }
    public string? Letter { get; set; } // 2025
    public bool? SecondTune { get; set; } // 1912

    public required string Title { get; set; }
    public string? Psalm { get; set; }
    public required List<string> Verses { get; set; }
    public string? Chorus { get; set; }
    public bool? IsCompletePsalm { get; set; } // 2025
    public int? NumVersesInsideStaff { get; set; } // 1912
    public required List<string> ScoreFiles { get; set; }
    public string? AudioFile { get; set; }
}